import {forwardRef, useEffect, useState} from "react";

import {caseStudies} from "./constants";
import {range, useWindowSize} from "./utils";

import "./background.css";

const Background = forwardRef((_, ref) => {
    // keep these aligned with CSS values
    const rowHeight = 120;
    const rowGap = 54;
    const rowOffset = 200;
    const titleGap = 100;

    const windowSize = useWindowSize();
    const [numLines, setNumLines] = useState(1);
    const [titleWidthsByCaseStudy, setTitleWidthsByCaseStudy] = useState([]);

    // calculate number of lines based on window height
    useEffect(() => {
        if (windowSize.height) {
            const newNumLines = Math.floor((windowSize.height - rowGap / 2) / (rowHeight + rowGap)) + 1;

            if (newNumLines !== numLines) {
                setNumLines(newNumLines);
            }
        }
    }, [windowSize]);

    // get width of title for each case study
    useEffect(() => {
        if (ref.current) {
            setTitleWidthsByCaseStudy(
                Array.from(ref.current.children).map(caseStudy => caseStudy.children[0].children[0].clientWidth)
            );
        }
    }, [ref.current]);

    return (
        <div {...{ref}} className="background">
            {caseStudies.map((caseStudy, caseStudyIndex) => (
                <div className="case-study" key={caseStudyIndex} style={{backgroundColor: caseStudy.color}}>
                    {range(numLines).map(rowIndex => {
                        const offset = rowOffset * (rowIndex + 1);
                        const numTitles =
                            Math.floor(
                                ((windowSize.width || 0) + offset + titleGap) /
                                    ((titleWidthsByCaseStudy.length > 0 ? titleWidthsByCaseStudy[caseStudyIndex] : 0) +
                                        titleGap)
                            ) + 1;

                        return (
                            <div className="row" key={rowIndex} style={{marginLeft: -1 * offset}}>
                                {range(numTitles).map(titleIndex => (
                                    <div className="title" key={titleIndex}>
                                        {caseStudy.name}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
});

export default Background;
