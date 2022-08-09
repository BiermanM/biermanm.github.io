import * as THREE from "three";
import {Fragment, Suspense, useEffect, useRef, useState} from "react";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {Center, Scroll, ScrollControls, softShadows, useProgress, useScroll, useTexture} from "@react-three/drei";
import useRefs from "react-use-refs";

import {caseStudies, CursorState} from "./constants";
import Background from "./background";
import Cursor from "./cursor";
import Footer from "./footer";
import LoadingScreen from "./loading-screen";
import MacBook3DModel from "./macbook";
import {
    cameraParallax,
    degToRad,
    getCameraPositionZ,
    getPagesScrollPerc,
    numPages,
    range,
    setCameraPositionZ,
} from "./utils";

import "./App.css";

/*
storyboard:
    0vh         =   full-screen closed laptop
    100vh       =   camera zoomed out, laptop fills 50vw
    200vh       =   laptop rotates so the base is visible and laptop lid opens
    300vh       =   case study #1
    ...         =   case study #n
    (n+1)*100vh =   all case studies close via genie effect
    (n+2)*100vh =   laptop lid closes
    (n+3)*100vh =   camera zooms in, fit to container
    (n+4)*100vh =   laptop slides up to reveal footer
*/

softShadows();

const Composition = ({background, setCursorState, setProgress}) => {
    // get progress of 3D model and textures loading
    useProgress(state => setProgress(state.progress));

    const scroll = useScroll();
    const {camera, mouse, size, viewport} = useThree(state => state);
    const [macbook, lid, footer] = useRefs();
    const [laptopScreen] = useTexture(["/Chroma Red.jpg"]);
    const [cameraToObjectPos, setCameraToObjectPos] = useState(null);
    const [isLaptopHovered, setLaptopHovered] = useState(false);
    const cameraVector = new THREE.Vector3();

    // only make laptop clickable if a case study is open
    useEffect(() => {
        if (isLaptopHovered) {
            const {currentPage} = getPagesScrollPerc(scroll);

            if (
                range(caseStudies.length + 2, 2).includes(currentPage.index) &&
                currentPage.position > 0.15 &&
                currentPage.position < 0.85
            ) {
                setCursorState(CursorState.VIEW_LIVE_SITE);
            }
        } else {
            setCursorState(null);
        }
    }, [isLaptopHovered]);

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
            const {
                boundingBoxSize,
                cameraZPosition: cameraZPosition100,
                modelBottomZ,
            } = getCameraPositionZ(camera, macbook.current);
            const {cameraZPosition: cameraZPosition50} = getCameraPositionZ(camera, macbook.current, 0.5);

            setCameraToObjectPos({
                boundingBoxSize,
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

        // if camera-to-model calculations and footer do not yet exist, don't start animations
        if (!cameraToObjectPos || !footer?.current) {
            return;
        }

        // page 1: zoom out camera; laptop transitions from 100vw to 50vw
        if (currentPage.index === 0) {
            const cameraPos = {
                start: cameraToObjectPos.cameraZPos[100],
                end: cameraToObjectPos.cameraZPos[50],
            };

            macbook.current.position.y = 0;
            setCameraPositionZ(
                camera,
                cameraPos.start - (cameraPos.start - cameraPos.end) * currentPage.position,
                cameraToObjectPos.modelBottomZPos
            );
        }

        // page 2: laptop rotates so the base is visible while laptop lid opens;
        // rotate entire laptop 180deg -> 45deg and rotate laptop lid 360deg -> 135deg
        else if (currentPage.index === 1) {
            macbook.current.rotation.x = degToRad(180) - degToRad(135) * currentPage.position;
            lid.current.rotation.x = degToRad(360) - degToRad(225) * currentPage.position;
            macbook.current.position.y = -10 * currentPage.position;
            background.current.children[0].style.opacity = 0;

            // reset camera position from parallax during case studies
            cameraParallax(camera, cameraVector, mouse, true);
        }

        // pages 3 to (n+3): each case study
        else if (range(caseStudies.length + 2, 2).includes(currentPage.index)) {
            macbook.current.position.y = -10;

            const currentCaseStudyIndex = currentPage.index - 2;

            /*
                set background color based on current case study
                    0.0-0.05:   0% opacity
                    0.05-0.2:  scale from 0% to 100%
                    0.2-0.8:  100% opacity
                    0.8-0.95:  scale from 100% to 0%
                    0.95-1.0:   0% opacity
            */
            let opacity = 1;
            if (currentPage.position < 0.05 || currentPage.position > 0.95) {
                opacity = 0;
            } else if (currentPage.position < 0.2) {
                opacity = 1 - (0.2 - currentPage.position) * 10;
            } else if (currentPage.position > 0.8) {
                opacity = 1 - (currentPage.position - 0.8) * 10;
            }

            Array.from(background.current.children).forEach((caseStudyRef, index) => {
                caseStudyRef.style.opacity = index === currentCaseStudyIndex ? opacity : 0;
            });

            // camera parallax based on cursor position
            cameraParallax(camera, cameraVector, mouse);

            console.log("case study #" + currentCaseStudyIndex);
        }

        // page (n+4): all case studies close via genie effect
        else if (currentPage.index === caseStudies.length + 3) {
            background.current.children[caseStudies.length - 1].style.opacity = 0;

            // reset camera position from parallax during case studies
            cameraParallax(camera, cameraVector, mouse, true);

            console.log("all case studies close via genie effect");
        }

        // page (n+5): laptop lid closes; rotate laptop lid 135deg -> 360deg
        else if (currentPage.index === caseStudies.length + 4) {
            macbook.current.rotation.x = degToRad(45) + degToRad(135) * currentPage.position;
            lid.current.rotation.x = degToRad(135) + degToRad(225) * currentPage.position;
            macbook.current.position.y = -10 + 10 * currentPage.position;
        }

        // page (n+6): camera zooms in, fit to screen
        // TO-DO: fit to container
        else if (currentPage.index === caseStudies.length + 5) {
            lid.current.rotation.x = degToRad(360); // make sure laptop lid is fully closed
            macbook.current.position.y = 0; // make sure macbook is at origin

            const cameraPos = {
                start: cameraToObjectPos.cameraZPos[50],
                end: cameraToObjectPos.cameraZPos[100],
            };

            setCameraPositionZ(
                camera,
                cameraPos.start - (cameraPos.start - cameraPos.end) * currentPage.position,
                cameraToObjectPos.modelBottomZPos
            );
        }

        // page (n+7): laptop slides up to reveal footer
        else if (currentPage.index === caseStudies.length + 6) {
            macbook.current.position.y =
                (footer.current.clientHeight / size.height) *
                cameraToObjectPos.boundingBoxSize.y *
                currentPage.position;
        }
    });

    return (
        <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <spotLight position={[0, 0, 100]} angle={0.2} penumbra={1} intensity={0.1} />
            <Center>
                <MacBook3DModel
                    ref={{macbook, lid}}
                    texture={laptopScreen}
                    rotation={[degToRad(180), 0, 0]} // set initial rotation so lid is facing the camera
                    onPointerOver={() => setLaptopHovered(true)}
                    onPointerOut={() => setLaptopHovered(false)}
                />
            </Center>
            <Scroll html style={{width: "100%"}}>
                <Footer
                    {...{setCursorState}}
                    ref={footer}
                    style={
                        footer.current
                            ? {
                                  top: `${(numPages - 1) * 100}vh`,
                                  marginTop: `calc(100vh - ${footer.current.clientHeight}px)`,
                              }
                            : {}
                    }
                />
            </Scroll>
        </Suspense>
    );
};

const App = () => {
    const [progress, setProgress] = useState(0);
    const backgroundRef = useRef(null);
    const [cursorState, setCursorState] = useState(CursorState.COPY_EMAIL);

    console.log(cursorState);

    return (
        <>
            <Cursor {...{cursorState}} />
            <LoadingScreen {...{progress}} />
            <Canvas shadows dpr={[1, 2]} camera={{fov: 12}}>
                <ScrollControls pages={numPages}>
                    <Composition {...{setCursorState, setProgress}} background={backgroundRef} />
                </ScrollControls>
            </Canvas>
            <Background ref={backgroundRef} />
        </>
    );
};

export default App;
