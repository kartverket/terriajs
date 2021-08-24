import BoxGeometry from "terriajs-cesium/Source/Core/BoxGeometry";
import Cartesian3 from "terriajs-cesium/Source/Core/Cartesian3";
import Cesium from "../Cesium";
import Terria from "../Terria";

export default function DrawTestBox(cesium: Cesium, terria: Terria) {
  terria.cesium?.scene.primitives.add(
    new BoxGeometry({
      minimum: { x: 5.738706915, y: 58.95697919, z: 0 } as Cartesian3,
      maximum: new Cartesian3(5.738463895, 58.956918237, 10)
    })
  );
}
