import {useState} from "react";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {Center, softShadows, ScrollControls, useScroll, useTexture} from "@react-three/drei";
import useRefs from "react-use-refs";

import {caseStudies} from "./constants";
import MacBook3DModel from "./macbook";
import {getCameraPositionZ, getPagesScrollPerc, numPages, range, setCameraPositionZ} from "./utils";

import "./App.css";

/*
storyboard:
    0vh         =   full-screen closed laptop
    100vh       =   camera zoomed out, laptop fills 50vw
    200vh       =   laptop rotates so the base is visible
    300vh       =   laptop lid opens
    400vh       =   case study #1
    ...         =   case study #n
    (n+1)*100vh =   all case studies close via genie effect
    (n+2)*100vh =   laptop lid closes
    (n+3)*100vh =   camera zooms in, fit to container
    (n+4)*100vh =   laptop slides up to reveal footer
*/

softShadows();

const Composition = () => {
    const scroll = useScroll();
    const {camera, /* size, */ viewport} = useThree(state => state);
    const [macbook, lid, /* keyLight, stripLight, */ fillLight] = useRefs();
    const [laptopScreen] = useTexture(["/Chroma Red.jpg"]);
    const [cameraToObjectPos, setCameraToObjectPos] = useState(null);

    useFrame((/*state, delta*/) => {
        const {currentPage} = getPagesScrollPerc(scroll);

        // once model exists, calculate position between camera and model in
        // order for model to fill entire window
        if (
            macbook.current &&
            (cameraToObjectPos === null ||
                cameraToObjectPos.vw !== viewport.width ||
                cameraToObjectPos.vh !== viewport.height)
        ) {
            const {cameraZPosition: cameraZPosition100, modelBottomZ} = getCameraPositionZ(camera, macbook.current);
            const {cameraZPosition: cameraZPosition50} = getCameraPositionZ(camera, macbook.current, 0.5);

            setCameraToObjectPos({
                cameraZPos: {
                    50: cameraZPosition50,
                    100: cameraZPosition100,
                },
                modelBottomZPos: modelBottomZ,
                vw: viewport.width,
                vh: viewport.height,
            });
        }

        // set camera position once 3D model exists and is at top of page
        // (including on screen resize)
        if (cameraToObjectPos !== null && currentPage.index === 0 && currentPage.position < 0.001) {
            setCameraPositionZ(camera, cameraToObjectPos.cameraZPos[100], cameraToObjectPos.modelBottomZPos);
        }

        // if camera-to-model calculations do not yet exist, don't start animations
        if (!cameraToObjectPos) {
            return;
        }

        // page 1: zoom out camera; laptop transitions from 100vw to 50vw
        if (currentPage.index === 0) {
            const cameraPos = {
                start: cameraToObjectPos.cameraZPos[100],
                end: cameraToObjectPos.cameraZPos[50],
            };

            setCameraPositionZ(
                camera,
                cameraPos.start - (cameraPos.start - cameraPos.end) * currentPage.position,
                cameraToObjectPos.modelBottomZPos
            );
        }

        // page 2: laptop rotates so the base is visible; rotate entire laptop 180deg -> 45deg
        else if (currentPage.index === 1) {
            macbook.current.rotation.x = Math.PI * 0.5 - Math.PI * 0.375 * currentPage.position;
        }

        // page 3: laptop lid opens; rotate laptop lid 360deg -> 225deg
        else if (currentPage.index === 2) {
            lid.current.rotation.x = Math.PI - Math.PI * 0.625 * currentPage.position;
            macbook.current.position.y = -10 * currentPage.position;
        }
    });

    return (
        <>
            <spotLight ref={fillLight} position={[0, 0, 100]} angle={0.2} penumbra={1} intensity={0.1} />
            <Center>
                <MacBook3DModel
                    ref={{macbook, lid}}
                    texture={laptopScreen}
                    rotation={[Math.PI / 2, 0, 0]} // set initial rotation so lid is facing the camera
                />
            </Center>
        </>
    );
};

const App = () => {
    return (
        <Canvas shadows dpr={[1, 2]} camera={{fov: 12}}>
            <ScrollControls pages={numPages + 8}>
                <Composition />
            </ScrollControls>
        </Canvas>
    );
};

export default App;
