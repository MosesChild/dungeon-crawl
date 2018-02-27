const w =
        0.98 *
        Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    h =
        0.85 *
        Math.max(
            document.documentElement.clientHeight,
            window.innerHeight || 0
        ),
    framesPerSecond = 30;


const environmentVars = {
    framesPerSecond: framesPerSecond,
    frameLength: 1000 / framesPerSecond,
    smallerSize: w < h ? w : h,
    gridSize: 200, // must match Board.maps.maxWidth and maxHeight;
    scale: this.smallerSize / this.gridSize
};
export default environmentVars;
