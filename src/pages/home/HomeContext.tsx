import React, { createContext, useState } from 'react'

export type TPoints = { x1: number; y1: number; x2: number; y2: number }
export type TRoiList = Array<{
  index: number;
  lineUpPoints: TPoints,
  lineBottomPoints?: TPoints
}>
export type TPolygonList = Array<{
    index: number;
    linePoints: Array<Array<number>>;
  }>

export const HomeContext = createContext<{
  isOnDrawing: boolean;
  updateIsOnDrawing?: (value: boolean) => void;
  roiList: TRoiList | null;
  updateRoiList?: (value : TRoiList) => void;
  polygonList: TPolygonList | null;
  updatePolygonList?: (value : TPolygonList) => void;
    }>({
      isOnDrawing: true,
      roiList: null,
      polygonList: null
    })

export const HomeContextProvider = (props: { children: JSX.Element | React.ReactElement }) => {
  const { children } = props

  const [ isOnDrawing, setIsOnDrawing ] = useState<boolean>(false)
  const [ roiList, setRoiList ] = useState<TRoiList>([])
  const [ polygonList, setPolygonList ] = useState<TPolygonList>([])

  const updateIsOnDrawing = (value: boolean) => setIsOnDrawing(value)

  const updateRoiList = (value: TRoiList) => setRoiList(value)

  const updatePolygonList = (value: TPolygonList) => setPolygonList(value)

  return (
    <HomeContext.Provider value={{
      isOnDrawing, updateIsOnDrawing,
      roiList, updateRoiList,
      polygonList, updatePolygonList
    }}>
      {children}
    </HomeContext.Provider>
  )
}