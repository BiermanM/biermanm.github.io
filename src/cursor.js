import {useEffect, useState} from "react";

import {cursorStateText} from "./constants";

import "./cursor.css";

const Cursor = ({cursorState}) => {
    const [position, setPosition] = useState({x: null, y: null});

    useEffect(() => {
        const mouseMoveHandler = e => setPosition({x: e.clientX, y: e.clientY});
        document.addEventListener("mousemove", mouseMoveHandler);

        return () => document.removeEventListener("mousemove", mouseMoveHandler);
    }, []);

    return (
        <>
            <div
                className="cursor"
                style={
                    position.x !== null && position.y !== null
                        ? {left: position.x - 8, top: position.y - 8}
                        : {display: "none"}
                }
            ></div>
            <div
                className={`cursor-action ${cursorState ? "active" : ""}`}
                style={
                    position.x !== null && position.y !== null
                        ? {left: position.x - 36, top: position.y - 36}
                        : {display: "none"}
                }
            >
                {cursorStateText[cursorState]}
            </div>
        </>
    );
};

export default Cursor;
