// import BoxGeometry from "terriajs-cesium/Source/Core/BoxGeometry";
// import Cartesian3 from "terriajs-cesium/Source/Core/Cartesian3";
// import GeometryInstance from "terriajs-cesium/Source/Core/GeometryInstance";
// import Matrix4 from "terriajs-cesium/Source/Core/Matrix4";
// import PolygonGeometry from "terriajs-cesium/Source/Core/PolygonGeometry";
// import Transforms from "terriajs-cesium/Source/Core/Transforms";
// import PerInstanceColorAppearance from "terriajs-cesium/Source/Scene/PerInstanceColorAppearance";
// import Polyline from "terriajs-cesium/Source/Scene/Polyline";
// import PolylineCollection from "terriajs-cesium/Source/Scene/PolylineCollection";
// import Primitive from "terriajs-cesium/Source/Scene/Primitive";
// import Cesium from "../Cesium";
// import Terria from "../Terria";

// const degrees = [
//   5.708237955,  // long
//   58.962374539, // lat
//   5.708214243,  // long
//   58.962404224, // lat
//   5.708115328,
//   58.962383192,
//   5.708138867,
//   58.962353502,
//   5.708237955,
//   58.962374539
// ];

// const cartesian = Cartesian3.fromDegreesArray(degrees);

// export default function CreateTestBox() {
//   const polygon = PolygonGeometry.fromPositions({positions: cartesian, height:10, extrudedHeight:30.0});
//   const polyModelMatrix = Transforms.eastNorthUpToFixedFrame(cartesian[0])
//   const instance = new GeometryInstance({geometry: polygon, modelMatrix:polyModelMatrix});

//   let pc = new PolylineCollection();
//   // let z = 0;
//   for(var i = 1; i < cartesian.length; i++){
//     // cartesian[i-1].z = z;
//     pc.add({positions: [cartesian[i-1], cartesian[i]], width: 1, extrudedHeight:100});
//     //console.log(i);
//   }
//   // cartesian[cartesian.length-1].z = z;
//   console.log(pc);
//   return pc;
//   return new Primitive({
//     geometryInstances: instance,
//     appearance: new PerInstanceColorAppearance({
//       closed: true,
//     })
//   });//({positions: cartesian, extrudedHeight: 3.0})
// }
