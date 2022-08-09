import {GitHubLogo, LinkedInLogo, WorkingNotWorkingLogo} from "./icons";

export const caseStudies = [
    {name: "SiriusXM 2022 Trend Report", color: "blue"},
    {name: "Ares Security Corp", color: "red"},
    {name: "SeedAI", color: "lightblue"},
    {name: "Cast It Reach", color: "purple"},
];

export const companiesAndSelectedClients = [
    "SeedAI",
    "Ares Security Corp",
    "SafeGraph",
    "SiriusXM Media",
    "AT&T",
    "be mindful beverages",
    "Dot Slash Digital",
    "Tailwind Talent",
    "Oscar Health",
];

export const email = "matt@bierman.io";

export const socialMedia = [
    {
        destination: "https://linkedin.com/in/biermanm",
        logo: <LinkedInLogo />,
        name: "LinkedIn",
    },
    {
        destination: "https://github.com/BiermanM",
        logo: <GitHubLogo />,
        name: "GitHub",
    },
    {
        destination: "https://workingnotworking.com/108158-matthew",
        logo: <WorkingNotWorkingLogo />,
        name: "Working Not Working",
    },
];

export const CursorState = {
    COPY_EMAIL: "COPY_EMAIL",
    OPEN_LINK: "OPEN_LINK",
    VIEW_LIVE_SITE: "VIEW_LIVE_SITE",
};

export const cursorStateText = {
    COPY_EMAIL: "copy email",
    OPEN_LINK: "open link",
    VIEW_LIVE_SITE: "view live site",
};
