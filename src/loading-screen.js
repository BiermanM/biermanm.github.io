import {useEffect, useState} from "react";

import {Logo} from "./icons";
import {unfreezeScroll, useWindowSize, wait} from "./utils";

import "./loading-screen.css";

const LoadingScreen = ({progress}) => {
    const [styling, setStyling] = useState({});
    const windowSize = useWindowSize();

    useEffect(() => {
        const hideAnimation = async () => {
            await wait(2);
            setStyling({opacity: 0});
            await wait(1);
            setStyling({opacity: 0, display: "none"});
            unfreezeScroll();
        };

        if (progress === 100) {
            hideAnimation();
        }
    }, [progress]);

    return (
        <div className="loading-screen" style={styling}>
            <div className="logo">
                <Logo height={(windowSize.height || 0) * 0.19} />
            </div>
            <div className={`progress-bar ${progress === 100 ? "complete" : ""}`}>
                <div
                    className="current-progress"
                    style={{clipPath: `polygon(0 0, ${progress}% 0%, ${progress}% 100%, 0% 100%)`}}
                ></div>
            </div>
        </div>
    );
};

export default LoadingScreen;
