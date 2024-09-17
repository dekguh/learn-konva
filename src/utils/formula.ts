import { TPoints } from '@/pages/home/HomeContext'
import { TObjCoordinate } from '@/typed/global'

type TCalculateCoorCenterLine = (value: TObjCoordinate) => Array<number>

export const calculateCoorCenterLine : TCalculateCoorCenterLine = (value) => {
  return [(value.x1 + value.x2)/2, (value.y1 + value.y2)/2]
}

export const getNextLineCoordinate = (value: TObjCoordinate, distance : number) => {
  const lineVectorX = value.x2 - value.x1
  const lineVectorY = value.y2 - value.y1

  const length = Math.sqrt(lineVectorX * lineVectorX + lineVectorY * lineVectorY)

  const unitVectorX = lineVectorX / length
  const unitVectorY = lineVectorY / length

  const perpendicularVectorX = -unitVectorY
  const perpendicularVectorY = unitVectorX

  const x1Next = value.x1 + distance * perpendicularVectorX
  const y1Next = value.y1 + distance * perpendicularVectorY
  const x2Next = value.x2 + distance * perpendicularVectorX
  const y2Next = value.y2 + distance * perpendicularVectorY

  return {
    x1: x1Next,
    y1: y1Next,
    x2: x2Next,
    y2: y2Next
  } as TPoints
}

export const convertObjPointsToArray = (value: TObjCoordinate) => Object.keys(value).map(key => value[key])

export const getAngleDegreesFromPoints = (value: TPoints) : number => {
  const dx = value.x2 - value.x1
  const dy = value.y2 - value.y1
  const radians = Math.atan2(dy, dx)
  let degrees = radians * (180 / Math.PI)

  if (degrees < 0) {
    degrees += 360
  }
    
  return degrees
}
