// ============================================================
// COLLEGE BASKETBALL NARRATIVE VISUALIZATION
//
// Scene 1: Tournament Seeds
// Scene 2: Over / Under Seeded
// Scene 3: March Results
// Scene 4: Over / Under Performers
// Scene 5: Cinderellas
//
// Exploration:
// Select a year and revisit any scene.
//
// Library restriction:
// D3 only
// ============================================================


// ============================================================
// CHART SETTINGS
// ============================================================

const width = 1100;

const height = 700;

const margin = {

    top: 100,

    right: 100,

    bottom: 90,

    left: 100

};


// ============================================================
// SVG
// ============================================================

const svg = d3.select("#visualization")
    .attr("width", width)
    .attr("height", height);


// ============================================================
// GLOBAL DATA
// ============================================================

let allData = [];

let allYears = [];

let currentYear = null;

let currentYearData = [];

let currentScene = 1;


// ============================================================
// SETTINGS
// ============================================================

// Teams within this range of their seed-line average
// are considered "accurately seeded."
//
// +0.5 = somewhat stronger than average
// -0.5 = somewhat weaker than average

const SEED_THRESHOLD = 0.5;


// ============================================================
// TOOLTIP
// ============================================================

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");


// ============================================================
// POSTSEASON ORDER
//
// Higher number = further tournament progress
// ============================================================

const postseasonScore = {

    "R68": 0,

    "R64": 1,

    "R32": 2,

    "S16": 3,

    "E8": 4,

    "F4": 5,

    "2ND": 6,

    "Champion": 7

};


// ============================================================
// POSTSEASON LABEL
// ============================================================

function postseasonLabel(result) {

    if (result === "R68") {
        return "First Four";
    }

    if (result === "R64") {
        return "Round of 64";
    }

    if (result === "R32") {
        return "Round of 32";
    }

    if (result === "S16") {
        return "Sweet Sixteen";
    }

    if (result === "E8") {
        return "Elite Eight";
    }

    if (result === "F4") {
        return "Final Four";
    }

    if (result === "2ND") {
        return "Runner-up";
    }

    if (result === "Champion") {
        return "Champion";
    }

    return result;

}


// ============================================================
// POSTSEASON COLORS
// ============================================================

function postseasonColor(result) {

    if (result === "Champion") {
        return "#8B0000";
    }

    if (result === "2ND") {
        return "#D62728";
    }

    if (result === "F4") {
        return "#9467BD";
    }

    if (result === "E8") {
        return "#2CA02C";
    }

    if (result === "S16") {
        return "#17BECF";
    }

    if (result === "R32") {
        return "#FF7F0E";
    }

    if (result === "R64") {
        return "#BCBD22";
    }

    if (result === "R68") {
        return "#7F7F7F";
    }

    return "#AAAAAA";

}


// ============================================================
// SEED COLORS
// ============================================================

function seedColor(seed) {

    if (seed <= 4) {
        return "#1f77b4";
    }

    if (seed <= 8) {
        return "#2ca02c";
    }

    if (seed <= 12) {
        return "#ff7f0e";
    }

    return "#d62728";

}


// ============================================================
// LOAD DATA
// ============================================================

d3.csv("cbb.csv").then(function(data) {


    // --------------------------------------------------------
    // Convert numeric columns
    // --------------------------------------------------------

    data.forEach(function(d) {

        d.RK = +d.RK;

        d.G = +d.G;

        d.W = +d.W;

        d.ADJOE = +d.ADJOE;

        d.ADJDE = +d.ADJDE;

        d.BARTHAG = +d.BARTHAG;

        d.EFG_O = +d.EFG_O;

        d.EFG_D = +d.EFG_D;

        d.WAB = +d.WAB;

        d.SEED = +d.SEED;

        d.YEAR = +d.YEAR;

    });


    // --------------------------------------------------------
    // Save all data
    // --------------------------------------------------------

    allData = data;


    // --------------------------------------------------------
    // Get tournament years
    // --------------------------------------------------------

    allYears = Array.from(

        new Set(

            data.map(function(d) {

                return d.YEAR;

            })

        )

    ).sort(d3.descending);


    // --------------------------------------------------------
    // Start with newest year
    // --------------------------------------------------------

    currentYear = allYears[0];


    updateYearData();

    createYearSelector();

    drawCurrentScene();

});


// ============================================================
// FILTER TOURNAMENT FIELD
// ============================================================

function updateYearData() {

    currentYearData = allData.filter(function(d) {

        return (

            d.YEAR === currentYear &&

            d.SEED >= 1 &&

            d.SEED <= 16

        );

    });

}


// ============================================================
// COMMON CHART SCALES
//
// IMPORTANT:
// Every scene uses these exact same scales.
//
// Therefore teams never move between scenes.
// Only their highlighting changes.
// ============================================================

function getChartScales(data) {


    const x = d3.scaleLinear()

        .domain(

            d3.extent(

                data,

                function(d) {

                    return d.ADJOE;

                }

            )

        )

        .nice()

        .range([

            margin.left,

            width - margin.right

        ]);


    // Lower ADJDE = better defense.
    //
    // Multiply by -1 so better defense is higher.

    const y = d3.scaleLinear()

        .domain(

            d3.extent(

                data,

                function(d) {

                    return -d.ADJDE;

                }

            )

        )

        .nice()

        .range([

            height - margin.bottom,

            margin.top

        ]);


    return {

        x: x,

        y: y

    };

}


// ============================================================
// DRAW COMMON AXES
// ============================================================

function drawAxes(x, y) {


    // --------------------------------------------------------
    // X axis
    // --------------------------------------------------------

    svg.append("g")

        .attr(

            "transform",

            `translate(
                0,
                ${height - margin.bottom}
            )`

        )

        .call(

            d3.axisBottom(x)

                .ticks(8)

        );


    // --------------------------------------------------------
    // Y axis
    // --------------------------------------------------------

    svg.append("g")

        .attr(

            "transform",

            `translate(
                ${margin.left},
                0
            )`

        )

        .call(

            d3.axisLeft(y)

                .ticks(8)

        );


    // --------------------------------------------------------
    // X label
    // --------------------------------------------------------

    svg.append("text")

        .attr(

            "x",

            width / 2

        )

        .attr(

            "y",

            height - 35

        )

        .attr(

            "text-anchor",

            "middle"

        )

        .style(

            "font-size",

            "15px"

        )

        .text(

            "Adjusted Offensive Efficiency →"

        );


    // --------------------------------------------------------
    // Y label
    // --------------------------------------------------------

    svg.append("text")

        .attr(

            "transform",

            "rotate(-90)"

        )

        .attr(

            "x",

            -(height / 2)

        )

        .attr(

            "y",

            25

        )

        .attr(

            "text-anchor",

            "middle"

        )

        .style(

            "font-size",

            "15px"

        )

        .text(

            "Better Defensive Efficiency ↑"

        );

}


// ============================================================
// DRAW TEAM POINTS
//
// This is the SAME position in every scene.
// ============================================================

function drawTeams(data, x, y, colorFunction, opacityFunction) {


    const teams = svg.selectAll(".team")

        .data(

            data,

            function(d) {

                return d.TEAM;

            }

        )

        .enter()

        .append("circle")

        .attr(

            "class",

            "team"

        )

        .attr(

            "cx",

            function(d) {

                return x(d.ADJOE);

            }

        )

        .attr(

            "cy",

            function(d) {

                return y(-d.ADJDE);

            }

        )

        .attr(

            "r",

            7

        )

        .style(

            "fill",

            colorFunction

        )

        .style(

            "opacity",

            opacityFunction

        )

        .style(

            "stroke",

            "white"

        )

        .style(

            "stroke-width",

            1

        );


    addTooltip(teams);


    return teams;

}


// ============================================================
// TOOLTIP
// ============================================================

function addTooltip(selection) {


    selection

        .on(

            "mouseover",

            function(event, d) {


                d3.select(this)

                    .style(

                        "stroke",

                        "black"

                    )

                    .style(

                        "stroke-width",

                        2

                    );


                tooltip

                    .style(

                        "visibility",

                        "visible"

                    )

                    .html(`

                        <strong>
                            ${d.TEAM}
                        </strong>

                        <br>

                        Seed:
                        ${d.SEED}

                        <br>

                        Conference:
                        ${d.CONF}

                        <br><br>

                        Offense:
                        ${d.ADJOE.toFixed(1)}

                        <br>

                        Defense:
                        ${d.ADJDE.toFixed(1)}

                        <br>

                        BARTHAG:
                        ${(d.BARTHAG * 100).toFixed(1)}%

                        <br><br>

                        Result:
                        ${postseasonLabel(d.POSTSEASON)}

                    `);

            }

        )


        .on(

            "mousemove",

            function(event) {

                tooltip

                    .style(

                        "top",

                        `${event.pageY + 15}px`

                    )

                    .style(

                        "left",

                        `${event.pageX + 15}px`

                    );

            }

        )


        .on(

            "mouseout",

            function() {


                d3.select(this)

                    .style(

                        "stroke",

                        "white"

                    )

                    .style(

                        "stroke-width",

                        1

                    );


                tooltip

                    .style(

                        "visibility",

                        "hidden"

                    );

            }

        );

}


// ============================================================
// TITLE
// ============================================================

function drawTitle(title, subtitle) {


    svg.append("text")

        .attr(

            "x",

            margin.left

        )

        .attr(

            "y",

            40

        )

        .style(

            "font-size",

            "26px"

        )

        .style(

            "font-weight",

            "bold"

        )

        .text(title);


    svg.append("text")

        .attr(

            "x",

            margin.left

        )

        .attr(

            "y",

            65

        )

        .style(

            "font-size",

            "13px"

        )

        .style(

            "fill",

            "#666"

        )

        .text(subtitle);

}


// ============================================================
// SCENE MANAGER
// ============================================================

function drawCurrentScene() {


    if (currentScene === 1) {

        drawSceneOne(
            currentYearData,
            currentYear
        );

    }


    else if (currentScene === 2) {

        drawSceneTwo(
            currentYearData,
            currentYear
        );

    }


    else if (currentScene === 3) {

        drawSceneThree(
            currentYearData,
            currentYear
        );

    }


    else if (currentScene === 4) {

        drawSceneFour(
            currentYearData,
            currentYear
        );

    }


    else if (currentScene === 5) {

        drawSceneFive(
            currentYearData,
            currentYear
        );

    }


    // --------------------------------------------------------
    // Update scene indicator
    // --------------------------------------------------------

    d3.select("#scene-indicator")

        .text(

            `Scene ${currentScene} of 5`

        );


    // --------------------------------------------------------
    // Buttons
    // --------------------------------------------------------

    d3.select("#previous")

        .property(

            "disabled",

            currentScene === 1

        );


    d3.select("#next")

        .property(

            "disabled",

            currentScene === 5

        );


    // --------------------------------------------------------
    // Exploration appears after scene 5
    // --------------------------------------------------------

    if (currentScene === 5) {

        d3.select("#exploration")

            .style(

                "display",

                "block"

            );

    }

    else {

        d3.select("#exploration")

            .style(

                "display",

                "none"

            );

    }

}


// ============================================================
// NAVIGATION
// ============================================================

d3.select("#next")

    .on(

        "click",

        function() {


            if (currentScene < 5) {

                currentScene++;

                drawCurrentScene();

            }

        }

    );


d3.select("#previous")

    .on(

        "click",

        function() {


            if (currentScene > 1) {

                currentScene--;

                drawCurrentScene();

            }

        }

    );


// ============================================================
// SCENE 1
//
// TOURNAMENT SEEDS
// ============================================================

function drawSceneOne(data, year) {


    svg.selectAll("*").remove();


    const scales =
        getChartScales(data);


    const x = scales.x;

    const y = scales.y;


    drawTitle(

        `${year}: The Tournament Field`,

        "Every tournament team, colored by its NCAA tournament seed"

    );


    drawAxes(x, y);


    // --------------------------------------------------------
    // Teams
    // --------------------------------------------------------

    drawTeams(

        data,

        x,

        y,

        function(d) {

            return seedColor(d.SEED);

        },

        function() {

            return 0.85;

        }

    );


    // --------------------------------------------------------
    // Legend
    // --------------------------------------------------------

    drawSeedLegend();

}


// ============================================================
// SEED LEGEND
// ============================================================

function drawSeedLegend() {


    const legend = svg.append("g")

        .attr(

            "transform",

            `translate(
                ${width - margin.right - 100},
                ${margin.top}
            )`

        );


    const groups = [

        ["Seeds 1–4", "#1f77b4"],

        ["Seeds 5–8", "#2ca02c"],

        ["Seeds 9–12", "#ff7f0e"],

        ["Seeds 13–16", "#d62728"]

    ];


    groups.forEach(

        function(group, i) {


            const row = legend.append("g")

                .attr(

                    "transform",

                    `translate(
                        0,
                        ${i * 27}
                    )`

                );


            row.append("circle")

                .attr(

                    "r",

                    7

                )

                .style(

                    "fill",

                    group[1]

                );


            row.append("text")

                .attr(

                    "x",

                    15

                )

                .attr(

                    "y",

                    4

                )

                .style(

                    "font-size",

                    "12px"

                )

                .text(

                    group[0]

                );

        }

    );

}


// ============================================================
// CALCULATE SEED-LINE Z SCORES
//
// This is calculated from the teams in the current tournament
// field.
//
// Positive:
// stronger than average for that seed.
//
// Negative:
// weaker than average for that seed.
// ============================================================

function calculateSeedZScores(data) {


    const results = [];


    const seedGroups = d3.group(

        data,

        function(d) {

            return d.SEED;

        }

    );


    seedGroups.forEach(

        function(teams, seed) {


            const offenseMean = d3.mean(

                teams,

                function(d) {

                    return d.ADJOE;

                }

            );


            const offenseSD = d3.deviation(

                teams,

                function(d) {

                    return d.ADJOE;

                }

            );


            const defenseMean = d3.mean(

                teams,

                function(d) {

                    return d.ADJDE;

                }

            );


            const defenseSD = d3.deviation(

                teams,

                function(d) {

                    return d.ADJDE;

                }

            );


            teams.forEach(

                function(d) {


                    // Better offense = positive

                    d.offenseZ =

                        offenseSD

                            ? (
                                d.ADJOE -
                                offenseMean
                            ) / offenseSD

                            : 0;


                    // Lower ADJDE = better defense

                    d.defenseZ =

                        defenseSD

                            ? (
                                defenseMean -
                                d.ADJDE
                            ) / defenseSD

                            : 0;


                    // Overall statistical strength

                    d.seedRelativeZ =

                        (

                            d.offenseZ +

                            d.defenseZ

                        ) / 2;


                    results.push(d);

                }

            );

        }

    );


    return results;

}


// ============================================================
// SCENE 2
//
// OVERSEEDED / UNDERSEEDED
//
// Blue = underseeded
// Orange = overseeded
// Gray = approximately correctly seeded
// ============================================================

function drawSceneTwo(data, year) {


    svg.selectAll("*").remove();


    const scoredData =
        calculateSeedZScores(data);


    const scales =
        getChartScales(data);


    const x = scales.x;

    const y = scales.y;


    drawTitle(

        `${year}: Were They Seeded Correctly?`,

        "Blue teams were statistically stronger than their seed suggested; orange teams were weaker"

    );


    drawAxes(x, y);


    // --------------------------------------------------------
    // Team color
    // --------------------------------------------------------

    drawTeams(

        scoredData,

        x,

        y,

        function(d) {


            // Stronger than seed expectation

            if (
                d.seedRelativeZ >
                SEED_THRESHOLD
            ) {

                return "#1f77b4";

            }


            // Weaker than seed expectation

            if (
                d.seedRelativeZ <
                -SEED_THRESHOLD
            ) {

                return "#ff7f0e";

            }


            // Approximately correct

            return "#bdbdbd";

        },

        function(d) {


            if (
                Math.abs(d.seedRelativeZ) >
                SEED_THRESHOLD
            ) {

                return 0.9;

            }


            return 0.3;

        }

    );


    // --------------------------------------------------------
    // Legend
    // --------------------------------------------------------

    drawSimpleLegend(

        [

            ["Underseeded", "#1f77b4"],

            ["Accurately seeded", "#bdbdbd"],

            ["Overseeded", "#ff7f0e"]

        ]

    );


    // --------------------------------------------------------
    // Annotation
    // --------------------------------------------------------

    svg.append("text")

        .attr(

            "x",

            margin.left

        )

        .attr(

            "y",

            height - 10

        )

        .style(

            "font-size",

            "12px"

        )

        .style(

            "fill",

            "#666"

        )

        .text(

            `Teams within ±${SEED_THRESHOLD} standard deviations of their seed-line average are considered accurately seeded.`

        );

}


// ============================================================
// SCENE 3
//
// MARCH RESULTS
// ============================================================

function drawSceneThree(data, year) {


    svg.selectAll("*").remove();


    const scales =
        getChartScales(data);


    const x = scales.x;

    const y = scales.y;


    drawTitle(

        `${year}: Where Did They Finish?`,

        "The same teams, now highlighted by how far they advanced in March"

    );


    drawAxes(x, y);


    drawTeams(

        data,

        x,

        y,

        function(d) {

            return postseasonColor(
                d.POSTSEASON
            );

        },

        function() {

            return 0.85;

        }

    );


    drawPostseasonLegend();

}


// ============================================================
// POSTSEASON LEGEND
// ============================================================

function drawPostseasonLegend() {


    const legend = svg.append("g")

        .attr(

            "transform",

            `translate(
                ${width - margin.right - 100},
                ${margin.top - 5}
            )`

        );


    const outcomes = [

        ["Champion", "#8B0000"],

        ["Runner-up", "#D62728"],

        ["Final Four", "#9467BD"],

        ["Elite Eight", "#2CA02C"],

        ["Sweet Sixteen", "#17BECF"],

        ["Round of 32", "#FF7F0E"],

        ["Round of 64", "#BCBD22"],

        ["First Four", "#7F7F7F"]

    ];


    outcomes.forEach(

        function(outcome, i) {


            const row = legend.append("g")

                .attr(

                    "transform",

                    `translate(
                        0,
                        ${i * 24}
                    )`

                );


            row.append("circle")

                .attr(

                    "r",

                    6

                )

                .style(

                    "fill",

                    outcome[1]

                );


            row.append("text")

                .attr(

                    "x",

                    14

                )

                .attr(

                    "y",

                    4

                )

                .style(

                    "font-size",

                    "11px"

                )

                .text(

                    outcome[0]

                );

        }

    );

}


// ============================================================
// SCENE 4
//
// OVER / UNDER PERFORMERS
//
// Green = performed better than typical seed
// Red = performed worse than typical seed
// Gray = approximately expected
//
// Expected performance is based on the historical average
// tournament finish for that seed across ALL YEARS.
// ============================================================

function calculateExpectedPerformance(data) {

    const seedHistory = d3.group(

        allData.filter(function(d) {

            return (
                d.SEED >= 1 &&
                d.SEED <= 16 &&
                postseasonScore[d.POSTSEASON] !== undefined
            );

        }),

        function(d) {
            return d.SEED;
        }

    );


    const expected = new Map();


    seedHistory.forEach(function(teams, seed) {

        // Use the median because tournament results
        // are discrete and heavily skewed.

        const medianFinish = d3.median(

            teams,

            function(d) {

                return postseasonScore[
                    d.POSTSEASON
                ];

            }

        );


        expected.set(+seed, medianFinish);

    });


    data.forEach(function(d) {

        d.expectedFinish =
            expected.get(d.SEED);

        d.actualFinish =
            postseasonScore[d.POSTSEASON];


        d.performanceDifference =
            d.actualFinish -
            d.expectedFinish;

    });


    return data;

}


// ============================================================
// SCENE 4 DRAW
// ============================================================

function drawSceneFour(data, year) {


    svg.selectAll("*").remove();


    const scoredData =
        calculateExpectedPerformance(data);


    const scales =
        getChartScales(data);


    const x = scales.x;

    const y = scales.y;


    drawTitle(

        `${year}: Who Overperformed?`,

        "Green teams advanced farther than the historical average for their seed; red teams fell short"

    );


    drawAxes(x, y);


    drawTeams(

        scoredData,

        x,

        y,

        function(d) {

    if (d.performanceDifference >= 1) {

        return "#2ca02c"; // Overperformed

    }

    if (d.performanceDifference <= -1) {

        return "#d62728"; // Underperformed

    }

    return "#bdbdbd"; // Expected

},

        function(d) {

    if (Math.abs(d.performanceDifference) >= 1) {

        return 0.85;

    }

    return 0.3;

}

    );


    drawSimpleLegend(

        [

            ["Overperformed", "#2ca02c"],

            ["Exactly expected", "#bdbdbd"],

            ["Underperformed", "#d62728"]

        ]

    );

}


// ============================================================
// SCENE 5
//
// TRUE CINDERELLAS
//
// Definition:
//
// 1. Double-digit seed
// 2. Statistically close to the average for their seed
// 3. Reached Sweet Sixteen or farther
//
// This intentionally excludes teams that were heavily
// underseeded. Those teams were already statistically better
// than their seed suggested.
// ============================================================

function drawSceneFive(data, year) {


    svg.selectAll("*").remove();


    const seedData =
        calculateSeedZScores(data);


    const cinderellas =
        seedData.filter(

            function(d) {


                const reachedSweet16 =

                    d.POSTSEASON === "S16" ||

                    d.POSTSEASON === "E8" ||

                    d.POSTSEASON === "F4" ||

                    d.POSTSEASON === "2ND" ||

                    d.POSTSEASON === "Champion";


                return (

                    // Double-digit seed

                    d.SEED >= 10 &&


                    // Statistically close to
                    // average for its seed

                    Math.abs(
                        d.seedRelativeZ
                    ) <= 0.5 &&


                    // Deep tournament run

                    reachedSweet16

                );

            }

        );


    const scales =
        getChartScales(data);


    const x = scales.x;

    const y = scales.y;


    drawTitle(

        `${year}: The Cinderellas`,

        "Double-digit seeds that were statistically ordinary for their seed, yet reached the Sweet Sixteen or farther"

    );


    drawAxes(x, y);


    // --------------------------------------------------------
    // Background:
    // everyone stays in exactly the same location.
    // --------------------------------------------------------

    svg.selectAll(".background-team")

        .data(data)

        .enter()

        .append("circle")

        .attr(

            "class",

            "background-team"

        )

        .attr(

            "cx",

            function(d) {

                return x(d.ADJOE);

            }

        )

        .attr(

            "cy",

            function(d) {

                return y(-d.ADJDE);

            }

        )

        .attr(

            "r",

            6

        )

        .style(

            "fill",

            "#bdbdbd"

        )

        .style(

            "opacity",

            0.15

        );


    // --------------------------------------------------------
    // Highlight Cinderellas
    // --------------------------------------------------------

    const teams = svg.selectAll(".cinderella")

        .data(cinderellas)

        .enter()

        .append("circle")

        .attr(

            "class",

            "cinderella"

        )

        .attr(

            "cx",

            function(d) {

                return x(d.ADJOE);

            }

        )

        .attr(

            "cy",

            function(d) {

                return y(-d.ADJDE);

            }

        )

        .attr(

            "r",

            10

        )

        .style(

            "fill",

            "#2ca02c"

        )

        .style(

            "opacity",

            0.95

        )

        .style(

            "stroke",

            "black"

        )

        .style(

            "stroke-width",

            2

        );


    addTooltip(teams);


    // --------------------------------------------------------
    // Labels
    // --------------------------------------------------------

    cinderellas.forEach(

        function(d) {


            svg.append("text")

                .attr(

                    "x",

                    x(d.ADJOE) + 13

                )

                .attr(

                    "y",

                    y(-d.ADJDE) + 4

                )

                .style(

                    "font-size",

                    "12px"

                )

                .style(

                    "font-weight",

                    "bold"

                )

                .text(

                    `${d.TEAM} (#${d.SEED})`

                );

        }

    );


    // --------------------------------------------------------
    // Annotation
    // --------------------------------------------------------

    if (cinderellas.length > 0) {


        const centerX = d3.mean(

            cinderellas,

            function(d) {

                return x(d.ADJOE);

            }

        );


        const centerY = d3.mean(

            cinderellas,

            function(d) {

                return y(-d.ADJDE);

            }

        );


        svg.append("line")

            .attr(

                "x1",

                centerX + 180

            )

            .attr(

                "y1",

                centerY - 100

            )

            .attr(

                "x2",

                centerX + 20

            )

            .attr(

                "y2",

                centerY - 15

            )

            .style(

                "stroke",

                "black"

            )

            .style(

                "stroke-width",

                1.5

            );


        svg.append("text")

            .attr(

                "x",

                centerX + 185

            )

            .attr(

                "y",

                centerY - 105

            )

            .style(

                "font-size",

                "17px"

            )

            .style(

                "font-weight",

                "bold"

            )

            .text(

                `${cinderellas.length} Cinderellas`

            );


        svg.append("text")

            .attr(

                "x",

                centerX + 185

            )

            .attr(

                "y",

                centerY - 83

            )

            .style(

                "font-size",

                "12px"

            )

            .text(

                "accurately seeded, yet surprisingly successful"

            );

    }


    // --------------------------------------------------------
    // Explanation
    // --------------------------------------------------------

    svg.append("text")

        .attr(

            "x",

            margin.left

        )

        .attr(

            "y",

            height - 10

        )

        .style(

            "font-size",

            "12px"

        )

        .style(

            "fill",

            "#666"

        )

        .text(

            "Cinderella = seed 10 or worse + within ±0.5 SD of its seed-line average + Sweet Sixteen or better."

        );

}


// ============================================================
// SIMPLE LEGEND
// ============================================================

function drawSimpleLegend(items) {


    const legend = svg.append("g")

        .attr(

            "transform",

            `translate(
                ${width - margin.right - 100},
                ${margin.top}
            )`

        );


    items.forEach(

        function(item, i) {


            const row = legend.append("g")

                .attr(

                    "transform",

                    `translate(
                        0,
                        ${i * 27}
                    )`

                );


            row.append("circle")

                .attr(

                    "r",

                    7

                )

                .style(

                    "fill",

                    item[1]

                );


            row.append("text")

                .attr(

                    "x",

                    15

                )

                .attr(

                    "y",

                    4

                )

                .style(

                    "font-size",

                    "12px"

                )

                .text(

                    item[0]

                );

        }

    );

}


// ============================================================
// YEAR SELECTOR
// ============================================================

function createYearSelector() {


    const selector = d3.select(
        "#year-select"
    );


    selector

        .selectAll("option")

        .data(allYears)

        .enter()

        .append("option")

        .attr(

            "value",

            function(d) {

                return d;

            }

        )

        .text(

            function(d) {

                return d;

            }

        );


    selector.property(

        "value",

        currentYear

    );


    selector.on(

        "change",

        function() {


            currentYear =
                +this.value;


            updateYearData();


            drawCurrentScene();

        }

    );

}


// ============================================================
// EXPLORATION BUTTONS
// ============================================================

d3.select("#explore-scene-1")

    .on(

        "click",

        function() {

            currentScene = 1;

            drawCurrentScene();

        }

    );


d3.select("#explore-scene-2")

    .on(

        "click",

        function() {

            currentScene = 2;

            drawCurrentScene();

        }

    );


d3.select("#explore-scene-3")

    .on(

        "click",

        function() {

            currentScene = 3;

            drawCurrentScene();

        }

    );


d3.select("#explore-scene-4")

    .on(

        "click",

        function() {

            currentScene = 4;

            drawCurrentScene();

        }

    );


d3.select("#explore-scene-5")

    .on(

        "click",

        function() {

            currentScene = 5;

            drawCurrentScene();

        }

    );


// ============================================================
// END
// ============================================================