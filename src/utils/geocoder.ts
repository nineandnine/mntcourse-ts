import NodeGeocoder from 'node-geocoder'

const options: NodeGeocoder.Options = {
  provider: 'mapquest',
  httpAdapter: 'https',
  apiKey: 'ipTLZ9sOgGdtLVv5prxEPhGWZc0ryqWx',
  formatter: null,
}

const geocoder = NodeGeocoder(options)

export default geocoder
