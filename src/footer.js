import {forwardRef, useEffect, useRef, useState} from "react";

import {companiesAndSelectedClients, email, socialMedia} from "./constants";
import {Heart} from "./icons";
import {range, useWindowSize} from "./utils";

import "./footer.css";

const Footer = forwardRef(({style}, ref) => {
    const windowSize = useWindowSize();
    const currentYear = new Date().getFullYear();

    // for Companies & Selected Clients list, hide the separator between
    // company names if it's at the end of a line
    const companiesRef = useRef(null);
    useEffect(() => {
        if (companiesRef.current && windowSize.width) {
            const companies = companiesRef.current.children;
            let currentLinePos = companiesRef.current.children[0].offsetTop;
            let previousElement = companiesRef.current.children[0];

            Array.from(companies).forEach((company, index) => {
                // skip first element
                if (index === 0) {
                    return;
                }

                // if the current element is on the next line from the previous element,
                // hide the separator of the previous element (which is the last element
                // on the line above the current element)
                if (company.offsetTop !== currentLinePos) {
                    previousElement.children[1].children[0].style.backgroundColor = "transparent";
                    currentLinePos = company.offsetTop;
                } else {
                    previousElement.children[1].children[0].style.backgroundColor = "var(--black)";
                }

                previousElement = company;
            });
        }
    }, [windowSize.width]);

    // set width of carousel track since it needs to be manually set in
    // order to user the infinite animation
    const carouselRef = useRef(null);
    useEffect(() => {
        if (carouselRef.current) {
            carouselRef.current.style.width =
                carouselRef.current.children[0].clientWidth * carouselRef.current.children.length + "px";
        }
    }, [carouselRef]);

    const [isEmailHover, setEmailHover] = useState(false);

    return (
        <div {...{ref, style}} className="footer">
            <div className="companies-and-selected-clients">
                <div className="title">Companies & Selected Clients</div>
                <div className="list" ref={companiesRef}>
                    {companiesAndSelectedClients.map((company, index) => (
                        <div className="company" key={index}>
                            <div className="name">{company}</div>
                            {index !== companiesAndSelectedClients.length - 1 && (
                                <div className="circle-separator">
                                    <div className="circle"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="email-carousel">
                <div
                    className="carousel-track"
                    ref={carouselRef}
                    style={{animationPlayState: isEmailHover ? "paused" : "running"}}
                >
                    {range(4).map(index => (
                        <div key={index}>
                            <a
                                href={`mailto:${email}`}
                                onMouseOver={() => setEmailHover(true)}
                                onMouseOut={() => setEmailHover(false)}
                            >
                                {email}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
            <div className="personal-info">
                <div className="left">Matt Bierman</div>
                <div className="center">
                    <div className="copyright">&copy; {currentYear}, made with</div>
                    <div className="heart-icon">
                        <Heart />
                    </div>
                </div>
                <div className="right">
                    {socialMedia.map(social => (
                        <a
                            className="social-media"
                            href={social.destination}
                            key={social.name}
                            rel="noreferrer"
                            target="_blank"
                        >
                            {social.logo}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default Footer;
