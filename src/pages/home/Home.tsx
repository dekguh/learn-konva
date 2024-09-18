/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import React, { useContext, useRef, useState } from 'react'
import { Arrow, Layer, Line, Rect, Stage, Text } from 'react-konva'
import { HomeContext } from './HomeContext'
import { calculateCoorCenterLine, convertObjPointsToArray, getAngleDegreesFromPoints, getNextLineCoordinate } from '@/utils/formula'

const Home = () => {
  const {
    isOnDrawing, updateIsOnDrawing,
    roiList, updateRoiList,
    polygonList, updatePolygonList
  } = useContext(HomeContext)

  const [ typeShapeDraw, setTypeShapeDraw ] = useState<'roi' | 'polygon'>('roi')

  const cardContainerRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef<number>(0)

  const handleStageDblClick = (event: any) => {
    if (isOnDrawing && typeShapeDraw === 'polygon') {
      if (updateIsOnDrawing) updateIsOnDrawing(false)
      return
    }

    if (updateIsOnDrawing) updateIsOnDrawing(true)

    // START DRAW ROI
    if (updateRoiList && typeShapeDraw === 'roi') {
      currentIndexRef.current = Number((Math.random() * 1000).toFixed(0))
      updateRoiList([
        ...roiList ?? [],
        {
          index: currentIndexRef.current,
          lineUpPoints: {
            x1: event.target?.pointerPos.x, y1: event.target?.pointerPos.y,
            x2: event.target?.pointerPos.x, y2: event.target?.pointerPos.y
          }
        }
      ])
    }

    // START DRAW POLYGON
    if (updatePolygonList && typeShapeDraw === 'polygon') {
      currentIndexRef.current = Number((Math.random() * 1000).toFixed(0))
      updatePolygonList([
        ...polygonList ?? [],
        {
          index: currentIndexRef.current,
          linePoints: [
            [event.target?.pointerPos.x, event.target?.pointerPos.y]
          ]
        }
      ])
    }
  }

  const handleStageClick = (event: any) => {
    if (isOnDrawing) {
      // STOP DRAWING ROI
      if (updateRoiList && roiList?.length && typeShapeDraw === 'roi') updateRoiList(roiList.map((item) => {
        if (currentIndexRef.current === item.index) return {
          ...item,
          lineBottomPoints: getNextLineCoordinate(item.lineUpPoints, 120)
        }
        else return item
      }))
      if (updateIsOnDrawing && typeShapeDraw === 'roi') updateIsOnDrawing(false)

      // ADD MORE VERTICES POLYGON
      if (typeShapeDraw == 'polygon') {
        const tempPolygonList = polygonList ? [...polygonList] : []
        if (updatePolygonList) updatePolygonList(tempPolygonList.map((item) => {
          if (currentIndexRef.current === item.index) return {
            ...item,
            linePoints: [...item.linePoints, [event.target?.pointerPos?.x, event.target?.pointerPos?.y]]
          }
          else return item
        }))
      }
    }
  }

  const handleStageMouseMove = (event: any) => {
    // MAKE REAL PREVIEW LINE WHEN IS DRAWING
    if (isOnDrawing) {
      if (updateRoiList && roiList?.length) updateRoiList(roiList.map((item) => {
        if (currentIndexRef.current === item.index) return {
          ...item,
          lineUpPoints: {
            ...item.lineUpPoints,
            x2: event?.target?.pointerPos?.x, y2: event?.target?.pointerPos?.y
          }
        }
        else return item
      }))
    }
  }

  const handleRectDragMove = (event: any, position?: 'up' | 'bottom', type?: 'start' | 'end') => {
    if (updateRoiList && roiList?.length && typeShapeDraw === 'roi') updateRoiList(roiList.map((item) => {
      if (Number(event.target.attrs.name) === item.index) {
        const coorItem = type === 'start'
          ? {
            x1: event.target?._lastPos?.x, y1: event.target?._lastPos?.y
          }
          : {
            x2: event.target?._lastPos?.x, y2: event.target?._lastPos?.y
          }

        return {
          ...item,
          [position === 'bottom' ? 'lineBottomPoints' : 'lineUpPoints']: {
            ...item?.[position === 'bottom' ? 'lineBottomPoints' : 'lineUpPoints'],
            ...coorItem
          }
        }
      }
      else return item
    }))
    else if (updatePolygonList && polygonList?.length && typeShapeDraw === 'polygon') updatePolygonList(polygonList.map((item) => {
      const indexPolygon = Number(event.target.attrs.name.split('-')[0])
      const indexVertices = Number(event.target.attrs.name.split('-')[1])

      if (indexPolygon === item.index) {
        return {
          ...item,
          linePoints: item.linePoints.map((valueLinePoint, indexLinePoint) => {
            return indexVertices === indexLinePoint ? [
              event.target?._lastPos?.x, event.target?._lastPos?.y
            ] : valueLinePoint
          })
        }
      } else return item
    }))
  }

  const handleClearAllClick = () : void => {
    if (updateRoiList) updateRoiList([])
    if (updatePolygonList) updatePolygonList([])
  }

  const handleDrawClick = (type: 'roi' | 'polygon') : void => {
    setTypeShapeDraw(type)
  }

  return (
    <>
      <div className="flex flex-row gap-2">
        <Button onClick={handleClearAllClick} style={{ margin: '24px 0 0 24px' }}>
          Clear All
        </Button>

        <Button onClick={() => handleDrawClick('roi')} style={{ margin: '24px 0 0 24px' }}>
          Draw ROI
        </Button>

        <Button onClick={() => handleDrawClick('polygon')} style={{ margin: '24px 0 0 24px' }}>
          Draw Polygon
        </Button>

        {(isOnDrawing && typeShapeDraw === 'polygon') && <Button onClick={() => updateIsOnDrawing && updateIsOnDrawing(false)} style={{ margin: '24px 0 0 24px' }}>
          Stop Draw Polygon
        </Button>}
      </div>

      <Card ref={cardContainerRef} style={{ margin: '24px', padding: '24px', height: '400px' }}>
        <Stage
          height={cardContainerRef.current?.offsetHeight ?? 400}
          width={cardContainerRef.current?.offsetWidth ?? 1200}
          onDblClick={handleStageDblClick}
          onClick={handleStageClick}
          onMouseMove={handleStageMouseMove}
        >
          {/* LAYER ROI */}
          <Layer>
            {roiList?.map((item, index) => (
              <React.Fragment key={index}>
                {/* TEXT IN AND OUT */}
                {(item.lineUpPoints && item.lineBottomPoints) && (
                  <>
                    <Text
                      x={getNextLineCoordinate(item.lineUpPoints, -20).x1}
                      y={getNextLineCoordinate(item.lineUpPoints, -20).y1}
                      text="in"
                      rotation={getAngleDegreesFromPoints(item.lineUpPoints)}
                    />

                    <Text
                      x={getNextLineCoordinate(item.lineUpPoints, -20).x2}
                      y={getNextLineCoordinate(item.lineUpPoints, -20).y2}
                      text="in"
                      rotation={getAngleDegreesFromPoints(item.lineUpPoints)}
                    />

                    <Text
                      x={getNextLineCoordinate(item.lineBottomPoints, 20).x1}
                      y={getNextLineCoordinate(item.lineBottomPoints, 20).y1}
                      text="out"
                      rotation={getAngleDegreesFromPoints(item.lineBottomPoints)}
                    />

                    <Text
                      x={getNextLineCoordinate(item.lineBottomPoints, 20).x2}
                      y={getNextLineCoordinate(item.lineBottomPoints, 20).y2}
                      text="out"
                      rotation={getAngleDegreesFromPoints(item.lineBottomPoints)}
                    />
                  </>
                )}
                {/* LINE UP */}
                <Line
                  name={`${item.index}`}
                  points={convertObjPointsToArray(item.lineUpPoints)}
                  stroke="red"
                  strokeWidth={4}
                />

                {/* RECT LINE UP */}
                {(item.lineUpPoints && item.lineBottomPoints) && <>
                  <Rect
                    name={`${item.index}`}
                    draggable
                    x={item.lineUpPoints.x1}
                    y={item.lineUpPoints.y1}
                    fill="red"
                    width={12}
                    height={12}
                    onDragMove={event => handleRectDragMove(event, 'up', 'start')}
                    rotation={getAngleDegreesFromPoints(item.lineUpPoints)}
                  />
                  <Rect
                    name={`${item.index}`}
                    draggable
                    x={item.lineUpPoints.x2}
                    y={item.lineUpPoints.y2}
                    fill="red"
                    width={12}
                    height={12}
                    onDragMove={event => handleRectDragMove(event, 'up', 'end')}
                    rotation={getAngleDegreesFromPoints(item.lineUpPoints)}
                  />
                </>}

                {/* ARROW */}
                {(item.lineUpPoints && item.lineBottomPoints) && <Arrow
                  name={`${item.index}`}
                  points={[
                    ...calculateCoorCenterLine(item.lineUpPoints),
                    ...calculateCoorCenterLine(item.lineBottomPoints)
                  ]}
                  fill="blue"
                  stroke="blue"
                  strokeWidth={4}
                />}

                {/* BOTTOM LINE */}
                {item.lineBottomPoints && <Line
                  name={`${item.index}`}
                  points={convertObjPointsToArray(item.lineBottomPoints)}
                  stroke="red"
                  strokeWidth={4}
                />}

                {/* RECT LINE BOTTOM */}
                {(item.lineUpPoints && item.lineBottomPoints) && <>
                  <Rect
                    name={`${item.index}`}
                    draggable
                    x={item.lineBottomPoints.x1}
                    y={item.lineBottomPoints.y1}
                    fill="red"
                    width={12}
                    height={12}
                    onDragMove={event => handleRectDragMove(event, 'bottom', 'start')}
                    rotation={getAngleDegreesFromPoints(item.lineBottomPoints)}
                  />
                  <Rect
                    name={`${item.index}`}
                    draggable
                    x={item.lineBottomPoints.x2}
                    y={item.lineBottomPoints.y2}
                    fill="red"
                    width={12}
                    height={12}
                    onDragMove={event => handleRectDragMove(event, 'bottom', 'end')}
                    rotation={getAngleDegreesFromPoints(item.lineBottomPoints)}
                  />
                </>}
              </React.Fragment>
            ))}
          </Layer>

          {/* LAYER POLYGON */}
          <Layer>
            {polygonList?.map((item, index) => (
              <React.Fragment key={index}>
                <Line
                  name={`${item.index}`}
                  points={item.linePoints.flat()}
                  fill="blue"
                  opacity={0.4}
                  stroke="red"
                  strokeWidth={4}
                  closed
                />

                {item.linePoints.map((verticesPoints, indexVertices) => (
                  <Rect
                    key={indexVertices}
                    name={`${item.index}-${indexVertices}`}
                    draggable
                    x={verticesPoints[0]}
                    y={verticesPoints[1]}
                    fill="blue"
                    width={12}
                    height={12}
                    onDragMove={handleRectDragMove}
                  />
                ))}
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      </Card>
    </>
  )
}

export default Home