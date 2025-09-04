export function haversineMiles(a: {lat:number, lng:number}, b: {lat:number, lng:number}) {
  const R = 3958.8; // miles
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;

  const sinDLat = Math.sin(dLat/2);
  const sinDLng = Math.sin(dLng/2);

  const h = sinDLat*sinDLat + Math.cos(lat1)*Math.cos(lat2)*sinDLng*sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
  return R * c;
}
