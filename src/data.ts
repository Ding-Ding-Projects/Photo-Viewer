import type { Album, Photo } from './types'

export const ALBUMS: Album[] = [
  { id: 'iceland', name: 'Iceland' },
  { id: 'city', name: 'City Nights' },
  { id: 'portraits', name: 'Portraits' },
  { id: 'everyday', name: 'Everyday' },
  { id: 'dolomites', name: 'Dolomites' },
]

const LIB = '/sample-library'

export const BASE_PHOTOS: Photo[] = [
  {
    id: 'p1', src: `${LIB}/iceland-waterfall.jpg`, filename: 'DSC_4187.jpg', albumId: 'iceland', favorite: true,
    exif: { camera: 'Sony A7 IV', lens: 'FE 16-35mm f/2.8 GM', focal: '16 mm', aperture: 'f/11', shutter: '1/4 s', iso: 100,
            taken: '2025-08-14 11:32', width: 6000, height: 4000, size: '12.4 MB', location: 'Svartifoss, Iceland' },
  },
  {
    id: 'p2', src: `${LIB}/black-sand-beach.jpg`, filename: 'DSC_4231.jpg', albumId: 'iceland', favorite: false,
    exif: { camera: 'Sony A7 IV', lens: 'FE 16-35mm f/2.8 GM', focal: '24 mm', aperture: 'f/8', shutter: '1/60 s', iso: 200,
            taken: '2025-08-15 18:07', width: 6000, height: 4000, size: '11.1 MB', location: 'Reynisfjara, Iceland' },
  },
  {
    id: 'p3', src: `${LIB}/reykjavik-street.jpg`, filename: 'XF_0092.jpg', albumId: 'iceland', favorite: false,
    exif: { camera: 'Fujifilm X-T5', lens: 'XF 23mm f/1.4 R', focal: '23 mm', aperture: 'f/4', shutter: '1/250 s', iso: 160,
            taken: '2025-08-17 09:41', width: 6240, height: 4160, size: '9.8 MB', location: 'Reykjavík, Iceland' },
  },
  {
    id: 'p4', src: `${LIB}/tokyo-night.jpg`, filename: 'DSC_5502.jpg', albumId: 'city', favorite: true,
    exif: { camera: 'Sony A7 IV', lens: 'FE 35mm f/1.8', focal: '35 mm', aperture: 'f/2.8', shutter: '2.0 s', iso: 400,
            taken: '2025-06-02 19:26', width: 6000, height: 4000, size: '10.2 MB', location: 'Rainbow Bridge, Tokyo' },
  },
  {
    id: 'p5', src: `${LIB}/portrait-fisherman.jpg`, filename: 'R5_8817.jpg', albumId: 'portraits', favorite: false,
    exif: { camera: 'Canon EOS R5', lens: 'RF 85mm f/1.2L USM', focal: '85 mm', aperture: 'f/1.8', shutter: '1/400 s', iso: 100,
            taken: '2025-05-21 14:15', width: 8192, height: 5464, size: '14.7 MB', location: 'Howth Harbour, Dublin' },
  },
  {
    id: 'p6', src: `${LIB}/portrait-studio.jpg`, filename: 'R5_9023.jpg', albumId: 'portraits', favorite: false,
    exif: { camera: 'Canon EOS R5', lens: 'RF 85mm f/1.2L USM', focal: '85 mm', aperture: 'f/5.6', shutter: '1/160 s', iso: 100,
            taken: '2025-05-22 10:03', width: 8192, height: 5464, size: '13.5 MB', location: 'Studio B, Berlin' },
  },
  {
    id: 'p7', src: `${LIB}/coffee-flatlay.jpg`, filename: 'XF_0144.jpg', albumId: 'everyday', favorite: false,
    exif: { camera: 'Fujifilm X-T5', lens: 'XF 35mm f/2 R WR', focal: '35 mm', aperture: 'f/4', shutter: '1/125 s', iso: 320,
            taken: '2025-07-08 08:52', width: 6240, height: 4160, size: '8.9 MB', location: 'Home' },
  },
  {
    id: 'p8', src: `${LIB}/dolomites-hiker.jpg`, filename: 'DSC_6710.jpg', albumId: 'dolomites', favorite: false,
    exif: { camera: 'Sony A7 IV', lens: 'FE 16-35mm f/2.8 GM', focal: '16 mm', aperture: 'f/9', shutter: '1/320 s', iso: 100,
            taken: '2025-09-19 17:48', width: 6000, height: 4000, size: '12.9 MB', location: 'Seceda, Dolomites' },
  },
]
