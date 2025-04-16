// Fetch data from JSON and display it
d3.json("data.json").then(function(data) {
    // Sort data by deaths in descending order and take the top 10
    const top10Countries = data.features
        .sort((a, b) => b.attributes.Deaths - a.attributes.Deaths)
        .slice(0, 10);

        const dataDisplay = d3.select("#data-display");
        dataDisplay.append("h2")
            .text("Top 10 Countries with Highest Deaths")
            .style("margin", "20px 0");
        
        const table = dataDisplay.append("table")
            .style("margin", "20px 0")
            .style("border-collapse", "collapse")
            .style("width", "100%");
        
        const header = table.append("thead").append("tr");
        header.append("th").text("Country/Region");
        header.append("th").text("Confirmed");
        header.append("th").text("Recovered");
        header.append("th").text("Deaths");
        
        const tbody = table.append("tbody");
        top10Countries.forEach(function(d) {
            const row = tbody.append("tr");
            row.append("td").text(d.attributes.Country_Region);
            row.append("td").text(d.attributes.Confirmed);
            row.append("td").text(d.attributes.Recovered);
            row.append("td").text(d.attributes.Deaths);
        });
        

    // Call the function to render the Bar Chart (Top 10 Countries)
    createBarChart(top10Countries);

    // Call the function to render the Pie Chart
    createPieChart(top10Countries);

    // Call the function to render the remaining charts
    createScatterPlot(top10Countries);
    createBubbleChart(top10Countries);
    createLineChart(top10Countries);
    createRadialChart(top10Countries);
    createChoroplethMap(top10Countries);

    // Show the first chart on the home page
    showGraph(0);
});

// Create Bar Chart (for Top 10 Countries with Highest Deaths)
function createBarChart(data) {
    try {
        console.log('Creating bar chart...');
        const margin = { top: 40, right: 30, bottom: 60, left: 60 },
              width = 800 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

        // Clear any existing content
        d3.select("#bar-chart .chart").html("");

        const svg = d3.select("#bar-chart .chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Sort data by cases
        const sortedData = [...data]
            .sort((a, b) => b.attributes.Deaths - a.attributes.Deaths)
            .slice(0, 10);

        // X scale
        const x = d3.scaleBand()
            .range([0, width])
            .domain(sortedData.map(d => d.attributes.Country_Region))
            .padding(0.2);

        // Y scale
        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(sortedData, d => d.attributes.Deaths)]);

        // Add X axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        svg.append("g")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d => d3.format(".2s")(d)));

        // Tooltip
        const tooltip = d3.select("#bar-chart")
            .append("div")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.2)")
            .style("pointer-events", "none")
            .style("opacity", 0);

        // Add bars with interactivity
        svg.selectAll("rect")
            .data(sortedData)
            .enter()
            .append("rect")
            .attr("x", d => x(d.attributes.Country_Region))
            .attr("y", height)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", "#00b4d8")
            .transition()
            .duration(1000)
            .attr("y", d => y(d.attributes.Deaths))
            .attr("height", d => height - y(d.attributes.Deaths));

        // Add hover effect
        svg.selectAll("rect")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "#0077b6"); // Darker color on hover
                tooltip
                    .style("opacity", 1)
                    .html(`<strong>${d.attributes.Country_Region}</strong><br>Deaths: ${d3.format(",")(d.attributes.Deaths)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).attr("fill", "#00b4d8"); // Restore original color
                tooltip.style("opacity", 0);
            });

        // Add value labels on top of bars
        svg.selectAll(".value-label")
            .data(sortedData)
            .enter()
            .append("text")
            .attr("class", "value-label")
            .attr("x", d => x(d.attributes.Country_Region) + x.bandwidth()/2)
            .attr("y", d => y(d.attributes.Deaths) - 5)
            .attr("text-anchor", "middle")
            .text(d => d3.format(".2s")(d.attributes.Deaths))
            .style("font-size", "12px")
            .style("fill", "#333");

        // Add X axis label
        svg.append("text")
            .attr("transform", `translate(${width/2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .text("Countries");

        // Add Y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 15)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of Deaths");

        // Add chart title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Top 10 Countries by COVID-19 Deaths");

    } catch (error) {
        console.error('Error creating bar chart:', error);
    }
}


// Create Pie Chart (for Top 10 Countries with Highest Deaths)
function createPieChart(data) {
    try {
        console.log('Creating pie chart...');
        const margin = { top: 40, right: 30, bottom: 60, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
        const radius = Math.min(width, height) / 2;

        // Clear any existing content
        d3.select("#pie-chart .chart").html("");

        const svg = d3.select("#pie-chart .chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

        // Tooltip
        const tooltip = d3.select("#pie-chart .chart")
            .append("div")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("padding", "8px")
            .style("border", "1px solid #ddd")
            .style("border-radius", "4px")
            .style("display", "none")
            .style("pointer-events", "none");

        // Calculate death rate (deaths per 1000 cases) and sort
        const pieData = data
            .map(d => ({
                country: d.attributes.Country_Region,
                deathRate: (d.attributes.Deaths / d.attributes.Confirmed) * 1000,
                deaths: d.attributes.Deaths,
                cases: d.attributes.Confirmed
            }))
            .sort((a, b) => b.deathRate - a.deathRate)
            .slice(0, 8);

        const totalDeathRate = d3.sum(pieData, d => d.deathRate);

        const color = d3.scaleOrdinal()
            .domain(pieData.map(d => d.country))
            .range(d3.schemeTableau10);

        const pie = d3.pie()
            .value(d => d.deathRate)
            .sort(null);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        const arcClick = d3.arc()
            .innerRadius(0)
            .outerRadius(radius + 20); // Expands on click

        const arcs = svg.selectAll("arc")
            .data(pie(pieData))
            .enter()
            .append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.country))
            .transition()
            .duration(1000)
            .attrTween("d", function (d) {
                const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function (t) {
                    return arc(i(t));
                };
            });

        let selectedSlice = null;

        // Click effect
        arcs.on("click", function (event, d) {
            if (selectedSlice === this) {
                // Reset all slices
                arcs.select("path").transition().duration(500).attr("d", arc);
                tooltip.style("display", "none");
                selectedSlice = null;
            } else {
                // Reset all slices
                arcs.select("path").transition().duration(500).attr("d", arc);

                // Expand clicked slice
                d3.select(this).select("path")
                    .transition()
                    .duration(500)
                    .attr("d", arcClick);

                // Show tooltip
                tooltip.style("display", "block")
                    .html(`
                        <strong>${d.data.country}</strong><br/>
                        Deaths: ${d3.format(",")(d.data.deaths)}<br/>
                        Cases: ${d3.format(",")(d.data.cases)}<br/>
                        Death Rate: ${d.data.deathRate.toFixed(2)}‰
                    `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");

                selectedSlice = this;
            }
        });

        // Add percentage labels
        arcs.append("text")
            .attr("transform", d => {
                const [x, y] = arc.centroid(d);
                return `translate(${x}, ${y})`;
            })
            .attr("text-anchor", "middle")
            .text(d => {
                const percentage = ((d.data.deathRate / totalDeathRate) * 100).toFixed(1);
                return `${percentage}%`;
            })
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("fill", "#fff");

        // Add legend
        const legend = svg.selectAll(".legend")
            .data(pieData)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${width / 2 - 100}, ${-height / 2 + i * 20})`);

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => color(d.country));

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(d => `${d.country}: ${d.deathRate.toFixed(1)}‰`)
            .style("font-size", "12px");

        // Add chart title
        svg.append("text")
            .attr("x", 0)
            .attr("y", -height / 2 - 20)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Distribution of Death Rates Among Top 8 Countries");

    } catch (error) {
        console.error('Error creating pie chart:', error);
    }
}



function createScatterPlot(data) {
    try {
        console.log('Creating scatter plot...');
        const margin = { top: 40, right: 30, bottom: 60, left: 60 },
              width = 800 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

        // Clear any existing content
        d3.select("#scatter-plot .chart").html("");

        const svg = d3.select("#scatter-plot .chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X scale
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.attributes.Confirmed)])
            .range([0, width]);

        // Y scale
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.attributes.Deaths)])
            .range([height, 0]);

        // Add X axis
        const xAxis = svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickFormat(d => d3.format(".2s")(d)));

        // Add Y axis
        const yAxis = svg.append("g")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d => d3.format(".2s")(d)));

        // Add dots with fade-in animation
        const dots = svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.attributes.Confirmed))
            .attr("cy", d => y(d.attributes.Deaths))
            .attr("r", 0)  // Start with 0 radius for animation
            .attr("fill", "#00b4d8")
            .attr("opacity", 0.6)
            .transition()
            .duration(1000)
            .attr("r", 5); // Animate to final radius

        // Tooltip behavior
        const tooltip = d3.select("#scatter-plot .chart")
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("font-size", "12px");

        svg.selectAll("circle")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 8)
                    .attr("fill", "#0096c7");

                tooltip.style("visibility", "visible")
                    .html(`<strong>${d.attributes.Country_Region}</strong><br>
                           Cases: ${d3.format(".2s")(d.attributes.Confirmed)}<br>
                           Deaths: ${d3.format(".2s")(d.attributes.Deaths)}<br>
                           Death Rate: ${(d.attributes.Deaths / d.attributes.Confirmed * 100).toFixed(2)}%`);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 5)
                    .attr("fill", "#00b4d8");

                tooltip.style("visibility", "hidden");
            });

        // Add zoom and pan functionality
        const zoom = d3.zoom()
            .scaleExtent([1, 5])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", (event) => {
                const newX = event.transform.rescaleX(x);
                const newY = event.transform.rescaleY(y);
                xAxis.call(d3.axisBottom(newX));
                yAxis.call(d3.axisLeft(newY));

                svg.selectAll("circle")
                    .attr("cx", d => newX(d.attributes.Confirmed))
                    .attr("cy", d => newY(d.attributes.Deaths));
            });

        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(zoom);

        // Add X axis label
        svg.append("text")
            .attr("transform", `translate(${width/2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .text("Total Cases");

        // Add Y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 15)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Total Deaths");

        // Add chart title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Cases vs Deaths Correlation");

    } catch (error) {
        console.error('Error creating scatter plot:', error);
    }
}





// Create Bubble Chart (for COVID-19 Cases vs. Recovered)
function createBubbleChart(data) {
    const margin = { top: 70, right: 50, bottom: 70, left: 70 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
 
    const svg = d3.select("#bubble-chart")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom);
 
    const chartGroup = svg.append("g")
                          .attr("transform", `translate(${margin.left},${margin.top})`);
 
    const x = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.attributes.Confirmed)])
                .range([0, width]);
 
    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.attributes.Deaths)])
                .range([height, 0]);
 
    const radius = d3.scaleSqrt()
                     .domain([0, d3.max(data, d => d.attributes.Recovered)])
                     .range([0, 20]);
 
    // Create circles (bubbles)
    const bubbles = chartGroup.selectAll(".bubble")
                              .data(data)
                              .enter().append("circle")
                              .attr("class", "bubble")
                              .attr("cx", d => x(d.attributes.Confirmed))
                              .attr("cy", d => y(d.attributes.Deaths))
                              .attr("r", d => radius(d.attributes.Recovered))
                              .attr("fill", "steelblue")
                              .attr("opacity", 0.6);
 
    // Add X and Y axes
    chartGroup.append("g")
              .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(x));
 
    chartGroup.append("g")
              .call(d3.axisLeft(y));
 
    chartGroup.append("text")
              .attr("x", width / 2)
              .attr("y", -20)
              .attr("text-anchor", "middle")
              .style("font-size", "16px")
              .text("COVID-19 Cases vs. Recovered (Bubble Chart)");
 
    // Filter function to update the chart based on slider value
    function updateFilter() {
        const filterValue = parseInt(document.getElementById('confirmed-range').value);
        document.getElementById('range-value').textContent = filterValue;
 
        // Update the opacity of the bubbles based on the slider value
        bubbles.transition()
               .duration(500)
               .style('opacity', d => d.attributes.Confirmed <= filterValue ? 1 : 0.1);
    }
 
    // Attach event listener to the slider to update the chart when the range changes
    document.getElementById('confirmed-range').addEventListener('input', updateFilter);
 
    // Call the filter function once to apply the initial filter
    updateFilter();
 }
 
function createLineChart(data) {
    try {
        console.log('Creating line chart...');
        const margin = { top: 40, right: 30, bottom: 60, left: 60 },
              width = 800 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

        // Clear any existing content
        d3.select("#line-chart .chart").html("");

        const svg = d3.select("#line-chart .chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X scale (Confirmed cases)
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.attributes.Confirmed)])
            .range([0, width]);

        // Y scale (Deaths)
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.attributes.Deaths)])
            .range([height, 0]);

        // Line function
        const line = d3.line()
            .x(d => x(d.attributes.Confirmed))
            .y(d => y(d.attributes.Deaths));

        // Add the line path
        svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", "#00b4d8")
            .attr("stroke-width", 2);

        // Add X axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickFormat(d => d3.format(".2s")(d)))
            .append("text")
            .attr("x", width / 2)
            .attr("y", 40)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Confirmed Cases");

        // Add Y axis
        svg.append("g")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d => d3.format(".2s")(d)))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Deaths");

        // Add chart title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Confirmed Cases vs Deaths");

        // Add data points and labels
        svg.selectAll(".data-point")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("cx", d => x(d.attributes.Confirmed))
            .attr("cy", d => y(d.attributes.Deaths))
            .attr("r", 4)
            .attr("fill", "#ff7f0e")
            .on("mouseover", function(event, d) {
                const [x, y] = d3.pointer(event);

                // Remove any existing tooltips before adding new one
                svg.selectAll("text.tooltip").remove();

                // Tooltip logic
                d3.select(this)
                    .transition().duration(100)
                    .attr("r", 6)
                    .attr("fill", "#ffbb78");

                // Tooltip display
                svg.append("text")
                    .attr("class", "tooltip")
                    .attr("x", x + 10)
                    .attr("y", y - 10)
                    .style("font-size", "12px")
                    .text(`Country: ${d.attributes.Country_Region}, Confirmed: ${d.attributes.Confirmed}, Deaths: ${d.attributes.Deaths}`);
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition().duration(100)
                    .attr("r", 4)
                    .attr("fill", "#ff7f0e");

                // Remove tooltip on mouse out
                svg.selectAll("text.tooltip").remove();
            });

        // Add data labels near the points
        svg.selectAll(".label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => x(d.attributes.Confirmed) + 5)
            .attr("y", d => y(d.attributes.Deaths))
            .attr("dy", -10)
            .style("font-size", "10px")
            .text(d => d.attributes.Country_Region)
            .style("fill", "#555");

    } catch (error) {
        console.error('Error creating line chart:', error);
    }
}
function createRadialChart(data) {
    try {
        console.log('Creating radial chart...');
        const margin = { top: 40, right: 30, bottom: 60, left: 60 },
              width = 800 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom,
              radius = Math.min(width, height) / 2;

        // Clear any existing content
        d3.select("#radial-chart .chart").html("");

        const svg = d3.select("#radial-chart .chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // Define the attributes we want to display (Confirmed and Deaths only)
        const attributes = ["Confirmed", "Deaths"];

        // Define scale for the radius of the chart
        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.attributes.Confirmed, d.attributes.Deaths))])
            .range([0, radius]);

        // Define scale for the angle of the chart (for each attribute)
        const angleScale = d3.scaleBand()
            .domain(attributes)
            .range([0, 2 * Math.PI])
            .padding(0.1);

        // Add grid lines (circular)
        const grid = svg.append("g").attr("class", "grid");
        for (let i = 1; i <= 5; i++) {
            grid.append("circle")
                .attr("r", radiusScale(i * 20))
                .style("fill", "none")
                .style("stroke", "#ddd");
        }

        // Create the radar chart for each country
        data.forEach(function(d, i) {
            // Get the confirmed and deaths values for this country
            const dataArray = [
                d.attributes.Confirmed,
                d.attributes.Deaths
            ];

            // Define a line function to connect the points
            const line = d3.lineRadial()
                .angle((d, i) => angleScale(attributes[i]))
                .radius(d => radiusScale(d));

            // Create the path for the radar chart (area) for each country
            svg.append("path")
                .data([dataArray])
                .attr("class", "radial-area")
                .attr("d", line)
                .attr("fill", "rgba(0, 180, 216, 0.4)")
                .attr("stroke", "#00b4d8")
                .attr("stroke-width", 2)
                .style("opacity", 0.7);

            // Add a label for the country at the center of the chart
            svg.append("text")
                .attr("x", 0)
                .attr("y", -radius - 20)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .text(d.attributes.Country_Region);
        });

        // Add axis labels for each attribute (Confirmed and Deaths)
        svg.selectAll(".axis-label")
            .data(attributes)
            .enter()
            .append("text")
            .attr("class", "axis-label")
            .attr("x", (d, i) => radiusScale(d) * Math.cos(angleScale(d) - Math.PI / 2))
            .attr("y", (d, i) => radiusScale(d) * Math.sin(angleScale(d) - Math.PI / 2))
            .text(d => d)
            .style("font-size", "12px")
            .style("text-anchor", "middle")
            .style("fill", "#333");

    } catch (error) {
        console.error('Error creating radial chart:', error);
    }
}
async function createChoroplethMap(data) {
    try {
        console.log("Creating choropleth map...");

        const width = 900, height = 500;

        // Clear any existing SVG before creating a new one
        d3.select("#map").select("svg").remove();

        // Create an SVG element
        const svg = d3.select("#map")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // Define a projection and path generator
        const projection = d3.geoMercator()
            .scale(150)
            .translate([width / 2, height / 1.5]);

        const path = d3.geoPath().projection(projection);

        // Load the world map GeoJSON
        const world = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");

        // Merge the data with GeoJSON
        const countryData = {};
        data.forEach(d => {
            countryData[d.attributes.Country_Region] = d.attributes.Confirmed;
        });

        // Define a color scale
        const colorScale = d3.scaleSequential(d3.interpolateOranges)
            .domain([0, d3.max(data, d => d.attributes.Confirmed)]);

        // Tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.2)")
            .style("pointer-events", "none")
            .style("opacity", 0);

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(world.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", d => {
                const countryName = d.properties.name;
                return countryData[countryName] ? colorScale(countryData[countryName]) : "#ccc";
            })
            .attr("stroke", "#000")
            .attr("stroke-width", 0.3)
            .on("mouseover", function (event, d) {
                const countryName = d.properties.name;
                const confirmedCases = countryData[countryName] || "No Data";

                tooltip.style("opacity", 1)
                    .html(`<strong>${countryName}</strong><br>Confirmed: ${confirmedCases}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 30) + "px");

                d3.select(this).attr("stroke-width", 1);
            })
            .on("mousemove", function (event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
                d3.select(this).attr("stroke-width", 0.3);
            });

        // Add a legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 120}, 20)`);

        const legendScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.attributes.Confirmed)])
            .range([100, 0]);

        const legendAxis = d3.axisRight(legendScale)
            .ticks(5)
            .tickFormat(d => d3.format(".2s")(d));

        const gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%").attr("y1", "100%")
            .attr("x2", "0%").attr("y2", "0%");

        gradient.append("stop").attr("offset", "0%").attr("stop-color", d3.interpolateOranges(0));
        gradient.append("stop").attr("offset", "100%").attr("stop-color", d3.interpolateOranges(1));

        legend.append("rect")
            .attr("width", 10)
            .attr("height", 100)
            .style("fill", "url(#legend-gradient)");

        legend.append("g")
            .attr("transform", "translate(10, 0)")
            .call(legendAxis);

        legend.append("text")
            .attr("x", -30)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Confirmed Cases");

    } catch (error) {
        console.error("Error creating choropleth map:", error);
    }
}

