import {useEffect, useState} from "react";

import {unfreezeScroll, wait} from "./utils";

import "./loading-screen.css";

const Logo = () => <div style={{width: 200, height: "19vh", backgroundColor: "var(--dark-gray)"}}></div>;

const LoadingScreen = ({progress}) => {
    const [styling, setStyling] = useState({});

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
                <Logo />
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
