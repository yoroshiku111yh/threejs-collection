export const getTextureCover = (texture, planeSize, imageSize) => {
    const aspectOfPlane = planeSize.width / planeSize.height;
    const aspectOfImage = imageSize.width / imageSize.height;
    let yScale = 1;
    let xScale = aspectOfPlane / aspectOfImage;
    if (xScale > 1) { // it doesn't cover so based on x instead
        xScale = 1;
        yScale = aspectOfImage / aspectOfPlane;
    }
    texture.repeat.set(xScale, yScale);
    texture.offset.set((1 - xScale) / 2, (1 - yScale) / 2);
    return texture;
}