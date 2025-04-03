declare module "react-native-canvas" {
  class Canvas {
    constructor(width: number, height: number);
    getContext(contextId: "2d"): CanvasRenderingContext2D;
  }
  export default Canvas;
}
