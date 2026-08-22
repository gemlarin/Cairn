export type NpsImage = {
  url: string
  altText: string
  title: string
  caption: string
}

export type NpsPark = {
  id: string
  parkCode: string
  fullName: string
  description: string
  designation: string
  states: string
  url: string
  images: NpsImage[]
}

export type NpsListResponse<T> = {
  total: string
  limit: string
  start: string
  data: T[]
}
