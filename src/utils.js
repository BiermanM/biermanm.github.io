import * as THREE from "three";
import {useEffect, useState} from "react";

import {caseStudies} from "./constants";

// start: inclusive, end: exclusive
export const range = (end, start = 0) => [...Array(end).keys()].filter(num => num >= start);

export const freezeScroll = () => {
    document.body.style.overflow = "hidden";
};

export const unfreezeScroll = () => {
    document.body.style.overflow = "unset";
};

export const rsqw = (t, delta = 0.1, a = 1, f = 1 / (2 * Math.PI)) =>
    (a / Math.atan(1 / delta)) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta);

// convert degrees to radians
export const degToRad = degrees => Math.PI * (degrees / 360);

export const numPages = 7 + caseStudies.length;
export const pageLength = 1 / numPages; // used for 0.0-1.0 ranges

/*
    given a page number (between 0 and (numPages - 1)), get the percentage that that
    page is within the total page count. returns a decimal, 0.0-1.0 inclusive.
    e.g. if there are a total of 4 pages, getPagePosition(1) = 0.25
*/
export const getPagePosition = pageIndex => pageLength * pageIndex;

/*
    get percentage currently scrolled through for all pages. returns list of decimals,
    0.0-1.0 inclusive, one value for each page. the value will be 1.0 for pages that
    have been passed and 0.0 for pages that have not been reached.
    e.g. if there are 4 pages and you've scrolled 75% through page 2,
    getPagesScrollPerc(...) = {
        allPages: [1.0, 0.75, 0, 0],
        currentPage: {
            index: 1,       // zero-based, so page 1 = index 0
            position: 0.75,
        },
    }

    scroll param is the useScroll prop
*/
export const getPagesScrollPerc = scroll => {
    let currentPage = 0;

    const allPages = range(numPages).map(index => {
        const position = scroll.range(getPagePosition(index), pageLength);

        if (position >= 1) {
            currentPage += 1;
        }

        return position;
    });

    return {
        allPages,
        currentPage: {
            index: currentPage,
            position: allPages[currentPage],
        },
    };
};

/*
    get camera position so the model fills the window

    size is the percentage (0.0-1.0, inclusive) of the window to fill (default = 100%).
    if vh < vw, size * vh; if vw < vh, size * vw.
*/
export const getCameraPositionZ = (camera, object, size = 1) => {
    if (!object) {
        return;
    }

    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(object);

    let boundingBoxSize = new THREE.Vector3();
    boundingBox.getSize(boundingBoxSize);

    const fovW = camera.fov * (Math.PI / 180);
    const fovH = 2 * Math.atan(Math.tan(fovW / 2) * camera.aspect);
    const dx = boundingBoxSize.z / 2 + Math.abs(boundingBoxSize.x / 2 / Math.tan(fovH / 2));
    const dy = boundingBoxSize.z / 2 + Math.abs(boundingBoxSize.y / 2 / Math.tan(fovW / 2));

    return {
        boundingBoxSize,
        /*
            Math.max = fits object so object always fits entirely within the screen
            Math.min = fits object so the object's smallest side always fits within the screen
        */
        cameraZPosition: Math.min(dx, dy) / size,
        modelBottomZ: boundingBox.min.z,
    };
};

export const setCameraPositionZ = (camera, cameraZ, minZ) => {
    camera.position.set(0, 0, cameraZ);

    const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;

    camera.far = cameraToFarEdge * 3;
    camera.updateProjectionMatrix();
};

export const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
};

export const wait = seconds => {
    return new Promise(res => setTimeout(res, seconds * 1000));
};

export const cameraParallax = (camera, cameraVector, mouse, reset = false) => {
    let x = 0;
    let y = 0;

    if (!reset) {
        x = mouse.x * (camera.aspect > 1 ? camera.aspect : 1);
        y = mouse.y * (camera.aspect > 1 ? 1 : camera.aspect);
    }

    camera.position.lerp(cameraVector.set(x * 0.5, y * 0.5, camera.position.z), 0.02);
};
