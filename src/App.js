import {Fragment, Suspense, useState} from "react";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {
    Center,
    // ContactShadows,
    // Html,
    Scroll,
    ScrollControls,
    softShadows,
    useProgress,
    useScroll,
    useTexture,
} from "@react-three/drei";
import useRefs from "react-use-refs";

import {caseStudies} from "./constants";
import Footer from "./footer";
import LoadingScreen from "./loading-screen";
import MacBook3DModel from "./macbook";
import {degToRad, getCameraPositionZ, getPagesScrollPerc, numPages, range, setCameraPositionZ} from "./utils";

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

const Composition = ({setProgress}) => {
    useProgress(state => setProgress(state.progress));

    const scroll = useScroll();
    const {camera, size, viewport} = useThree(state => state);
    const [macbook, lid, /* keyLight, stripLight, */ fillLight, footer] = useRefs();
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
        }

        // pages 4 to (n+4): each case study
        else if (range(caseStudies.length + 2, 2).includes(currentPage.index)) {
            macbook.current.position.y = -10;
            console.log("case study #" + (currentPage.index - 2));
        }

        // page (n+5): all case studies close via genie effect
        else if (currentPage.index === caseStudies.length + 3) {
            console.log("all case studies close via genie effect");
        }

        // page (n+6): laptop lid closes; rotate laptop lid 135deg -> 360deg
        else if (currentPage.index === caseStudies.length + 4) {
            macbook.current.rotation.x = degToRad(45) + degToRad(135) * currentPage.position;
            lid.current.rotation.x = degToRad(135) + degToRad(225) * currentPage.position;
            macbook.current.position.y = -10 + 10 * currentPage.position;
        }

        // page (n+7): camera zooms in, fit to container
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

        // page (n+8): laptop slides up to reveal footer
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
            <spotLight ref={fillLight} position={[0, 0, 100]} angle={0.2} penumbra={1} intensity={0.1} />
            <Center>
                <MacBook3DModel
                    ref={{macbook, lid}}
                    texture={laptopScreen}
                    rotation={[degToRad(180), 0, 0]} // set initial rotation so lid is facing the camera
                />
            </Center>
            {/*
            <ContactShadows position={[0, -1.4, 0]} opacity={0.75} scale={10} blur={2.5} far={4} />
            */}
            <Scroll html style={{width: "100%"}}>
                <Footer
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

    return (
        <>
            <LoadingScreen {...{progress}} />
            <Canvas shadows dpr={[1, 2]} camera={{fov: 12}}>
                <ScrollControls pages={numPages}>
                    <Composition {...{setProgress}} />
                </ScrollControls>
            </Canvas>
        </>
    );
};

export default App;
