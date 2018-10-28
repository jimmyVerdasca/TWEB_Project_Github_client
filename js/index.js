let entryPoint = 'http://localhost:8080'

/**
 * Function used to asked to the server the informations needed to show
 * @param {*} path Path to the information
 * @param {*} search_opt The options we need to search users
 * @param {*} opts Options for searching
 */
function request(path, search_opt, opts = {}) {
  let url = entryPoint + '/' + path +  '?';
  let list_opt = Object.keys(search_opt);
  for(let i = 0; i < list_opt.length; ++i) {
    url += list_opt[i] + '=' + search_opt[list_opt[i]];
  }
  let options = {
    ...opts, 
    headers: {
      'Accept': 'application/json'
    }
  }
  return fetch(url, options)
  .then(res => {
    return res.json()
    .then((data) => {
      if (!res.ok) {
        throw new ResponseError(res, data);
      }
      return data;
    })});
}

/**
 * Elements used to have the same number in the inputs for the seed
 */
$('#seed1').keyup(function (){
  $('#seed2').val($(this).val());
  $('#seed3').val($(this).val());
});
$('#seed2').keyup(function (){
  $('#seed1').val($(this).val());
  $('#seed3').val($(this).val());
});
$('#seed3').keyup(function (){
  $('#seed1').val($(this).val());
  $('#seed2').val($(this).val());
});

/**
 * Function that goes to search user's followers with the provied seed
 * @param {*} seed Provided by client to search users
 */
function getUserFollowers(seed) {
  document.getElementById("followStatus").textContent = "Searching..."
  return request('follower', {'seed': seed});
}

let newSeed = 0; // Variable that helps to search users after checking for their followers
/**
 * This function search user's followers to know if we should follow it or not
 * because they have less than 10 followers
 */
function changeFollowersInfo() {
  let infosTwinder;
  getUserFollowers(document.getElementById("seed2").value).then(twinder => {
    infosTwinder = twinder;
    newSeed = parseInt(document.getElementById("seed2").value);
    selectUsers(infosTwinder);
  })
}

/**
 * Function to select the user using the seed that the client asks us
 * Checks also the user has less than 10 followers
 * @param {*} infoUsers The information of users
 */
function selectUsers(infoUsers) {
  const FOLLOWERS_LIMIT = 10;
  let i = 0;
  let find = true;
  // We check if it has less than 10 followers
  // The ID of the user is the provided seed + 1
  while(i < infoUsers.length && infoUsers[i]['nb_followers'] >= FOLLOWERS_LIMIT || (newSeed + 1) !== infoUsers[i]['id']) {
    // If the ID is not avaliable, we change the seed to adapt it
    if((newSeed + 1) !== infoUsers[i]['id']) {
      let diff = infoUsers[i]['id'] - newSeed - 1;
      newSeed += diff;
      continue;
    }
    ++i;
    ++newSeed;
    // If we can't find one between the 5 users received, we search again
    if(i === infoUsers.length) {
      find = false;
      getUserFollowers(newSeed).then(newTwinder => {
        selectUsers(newTwinder);
      });
    }
  }
  if(find) {
    showTwinderUsers(infoUsers, i);
  }
  find = true;
}

/**
 * This function is called if we find the user using the given seed and shows its profile picture
 * @param {*} showUsers contains the information of the user (name, picture and nb followers)
 * @param {*} noUser Which user we are selecting between the 5 searched by githubServer
 */
function showTwinderUsers(showUsers, noUser) {
  document.getElementById("usernamePic").innerHTML = showUsers[noUser]['login'];
  document.getElementById("nbFollowers").innerHTML = showUsers[noUser]['nb_followers'] + " followers"
  if(showUsers[noUser]['avatar_url'] !== null) {
    document.getElementById("profilePic1").href = showUsers[noUser]['avatar_url'];
    document.getElementById("profilePic2").src = showUsers[noUser]['avatar_url'];
    document.getElementById("profilePic3").href = showUsers[noUser]['avatar_url'];
    document.getElementById("followStatus").textContent = "Found :D"
  }else {
    document.getElementById("profilePic1").href = "images/user.jpg";
    document.getElementById("profilePic2").src = "images/user.jpg";
    document.getElementById("profilePic3").href = "images/user.jpg";
    document.getElementById("followStatus").textContent = "Picture not found :("
  }
}

/**
 * This function treats if we follow or not a user and goes to search the next one
 * As the client is not connected to GitHub, it won't really follow them but if it 
 * would do it, it would be instead of both console.log
 * @param {*} action To know if we follow or not that user
 */
function nextUser(action) {
  if(action) {
    console.log("Followed :D")
  }else {
    console.log("Not Followed D:")
  }

  // After follow, it goes to find next user
  ++newSeed;
  getUserFollowers(newSeed).then(newTwinder => {
    selectUsers(newTwinder);
  });
}

/**
 * This element is used to show the same inserted selection in both text inputs to search a user
 */
$('#username1').keyup(function (){
  $('#username2').val($(this).val());
});
$('#username2').keyup(function (){
  $('#username1').val($(this).val());
});

/**
 * Function to search selected user's commits
 * @param {*} username The user we want to search
 */
function getUserCommits(username) {
  return request('commit', {'user': username});
}

/**
 * Function to show the commits of a selected user name
 */
function changeCommitsInfo() {
  // Show the username searched
  document.getElementById("usernameSelected").textContent = document.getElementById("username2").value;
  // Go to search the user we want
  getUserCommits(document.getElementById("username2").value).then(commits => {
    let insert = document.getElementById("insertCommits");
    for (let i = 0, j = 1; i < Object.keys(commits).length; ++i, ++j) {
      // Creating the entry point with the fade event
      if(document.getElementById("commitsPlace" + j) === null) {
        // Creation of the place that will contain the commits
        let positionTag = document.createElement("div")
        positionTag.setAttribute("class", "col-block commit-item");
        positionTag.setAttribute("data-aos", "fade-up");
        positionTag.setAttribute("id", "commitsPlace"+ j);

        // Creating the title and commit text part
        let tag = document.createElement("div");
        tag.setAttribute("class", "commit-text");
        positionTag.appendChild(tag);
        
        // Creating the title part and inserting it first in the text part
        let commitTitle = document.createElement("h3");
        commitTitle.setAttribute("class", "h5");
        commitTitle.setAttribute("id", "title" + j);
        commitTitle.setAttribute("style", "color: #FFFFFF");
        tag.appendChild(commitTitle);

        // Inserting the correct title
        let title = document.createTextNode("Commit n°" + j);
        commitTitle.appendChild(title);

        // Creating the commit part and inserting it after in the text part
        let commitText = document.createElement("p");
        commitText.setAttribute("id", "text" + j);
        commitText.setAttribute("style", "font-weight: bold");
        tag.appendChild(commitText);

        // Inserting the correct commit
        let textCommit = document.createTextNode(commits[i]);
        commitText.appendChild(textCommit);

        // Inserting all in the html file
        insert.appendChild(positionTag);
      }else {
        // If we found something already, we delete all first and start again
        do {
          insert.removeChild(document.getElementById("commitsPlace" + j));
          ++j;
        }while(document.getElementById("commitsPlace" + j) !== null);
        j = 0;
        i = -1;
      }
    }
  })
}

/**
 * Function that send the seed and go to search user's stats
 * @param {*} seed Provided to search a user's stats
 */
function getUserStats(seed) {
  return request('stat', {'seed': seed});
}

function drawVerticalGraph(data, idHTML) {
  
  /**
   * utilitary method to calculate de height of a given bar given his index
   * @param {index} i 
   */
  function getHeight(i) {
    let height = chartHeight - spaceForLabels
    for (let j = 0; j < data.series.length; j++) {
      if ((i - j) % data.series.length == 0) {
        height -= (data.series[j].values[Math.floor(i/data.series.length)] / allMaxes[j]) * (chartHeight) / 3;
        return  height;
      } else {
        height -= (data.series[j].values[Math.floor(i/data.series.length)] / allMaxes[j]) * (chartHeight) / 3;
      }
    }
  }

  // array of possible power result. First is the more powerfull
  let levelClassification = ["goku", "god", "spartian", "knight", "goblin", "slime"];
  let level = [];

  let allMaxes = [];
  for (let k = 0; k < data.series.length; k++) {
    allMaxes.push(d3.max(data.series[k].values));
  }
  let maxOfMaxes = d3.max(allMaxes);

  let zippedData = [];
  for (var i=0; i<data.series[0].values.length; i++) {
    for (var j=0; j<data.series.length; j++) {
      zippedData.push(data.series[j].values[i]);
    }
  }

  let chartHeight  = 450,
  barWidth         = 20,
  groupWidth      = barWidth,
  gapBetweenGroups = 200,
  spaceForLabels   = 30,
  spaceForLegend   = 150;

  let color = d3.scaleOrdinal(d3.schemeCategory20);
  let chartWidth = barWidth * zippedData.length + gapBetweenGroups * data.series[0].values.length;

  for (let i = 0; i < data.labels.length; i++) {
    let index = (i + 1) * data.series.length - 1;
    level.push(levelClassification[Math.floor((getHeight(index) / chartHeight) * levelClassification.length)])
  }

  let y = d3.scaleLinear()
      .domain([0, d3.max(zippedData) * 3])
      .range([chartHeight, 0]);

  let x = d3.scaleLinear()
      .range([0, chartWidth]);

  let xAxis = d3.axisBottom()
      .scale(x)
      .tickFormat('')
      .tickSize(0);

  // Specify the chart area and dimensions
  let chart = createChart(idHTML, chartWidth, spaceForLabels + chartHeight);

  // Create bars
  let functionTransformation = function(d, i) {
    let x = gapBetweenGroups * (0.5 + Math.floor(i/data.series.length)) - Math.floor(i/(data.series.length)) * barWidth;
    return "translate(" + x + "," + spaceForLabels + ")";
  }
  let bar = createBar(chart, zippedData, functionTransformation);

  // Create rectangles of the correct width
  let functionX = function(d,i) {
    return d;
  };
  let functionY = function(d,i) {
    return getHeight(i);
  };
  let functionWidth = barWidth;
  let functionHeight = function(d, i) {
    for (let j = 0; j < data.series.length; j++) {
      if ((i - j) % data.series.length == 0) {
        return (d / allMaxes[j]) * (chartHeight) / 3;
      }
    }
  };
  drawRectangles(bar, data, color, functionX, functionY, functionWidth, functionHeight);
      
  // Draw labels
  drawLabels(chart, bar, data, -20, chartHeight - 10, function(d,i) {
    if (i % data.series.length === 0)
      return data.labels[Math.floor(i/data.series.length)];
    else
      return ""
    }
  );

  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) {
        let y = chartHeight
        return "translate(" + gapBetweenGroups/2 + ", " + y + ")"
      })
      .call(xAxis);

  var legendRectSize = 18,
      legendSpacing  = 4;

  drawLegend(chart, data, color, chartHeight, legendRectSize, legendSpacing, gapBetweenGroups, spaceForLabels);

  var classification = chart.selectAll('.classification')
      .data(level)
      .enter()
      .append('g');

  classification.append('text')
      .attr('class', 'classification')
      .attr('x', function(d, i) {
        return gapBetweenGroups * (0.5 + i) - i * barWidth + legendRectSize + 5;
      })
      .attr('y', function(d, i) {
        return getHeight((i + 1) * data.series.length - 1) + 2 * legendRectSize;
      })
      .text(function (d) { return d; });
}

function drawHorizontalGraph(data, idHTML) {

  let allMaxes = [];
  for (let k = 0; k < data.series.length; k++) {
    allMaxes.push(d3.max(data.series[k].values));
  }
  let maxOfMaxes = d3.max(allMaxes);

  var zippedData = [];
  for (var i=0; i<data.labels.length; i++) {
    for (var j=0; j<data.series.length; j++) {
      zippedData.push(data.series[j].values[i]);
    }
  }

  let chartWidth   = 450,
  barHeight        = 20,
  groupHeight      = barHeight * data.series.length,
  gapBetweenGroups = 100,
  spaceForLabels   = 80,
  spaceForLegend   = 150;

  // Color scale
  let color = d3.scaleOrdinal(d3.schemeCategory20);
  let chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

  let x = d3.scaleLinear()
      .domain([0, d3.max(zippedData)])
      .range([0, chartWidth]);

  let y = d3.scaleOrdinal()
      .range([chartHeight + gapBetweenGroups, 0]);

  let yAxis = d3.axisLeft()
      .scale(y)
      .tickFormat('')
      .tickSize(0);

  // Specify the chart area and dimensions
  let chart = createChart(idHTML, spaceForLabels + chartWidth + spaceForLegend, chartHeight);

  // Create bars
  let functionTransformation = function(d, i) {
    return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/data.series.length))) + ")";
  }
  let bar = createBar(chart, zippedData, functionTransformation);

  // Create rectangles of the correct width
  let functionX = 0;
  let functionY = 0;
  let functionWidth = function(d,i) {
    for (let j = 0; j < data.series.length; j++) {
      if ((i - j) % data.series.length == 0) {
        return (d / allMaxes[j]) * chartWidth;
      }
    }
  };
  let functionHeight = barHeight - 1;
  drawRectangles(bar, data, color, functionX, functionY, functionWidth, functionHeight);

  // Add text label in bar
  bar.append("text")
      .attr("x", 5)
      .attr("y", barHeight / 2)
      .attr("fill", "red")
      .attr("dy", ".35em")
      .text(function(d) {
        return d;
      });

  let yLabel = groupHeight / 2 - barHeight * 2;
  drawLabels(chart, bar, data, 5, yLabel, function(d,i) {
    if (i % data.series.length === 0) {
      return data.labels[Math.floor(i/data.series.length)];
    }else {
      return "";
    }
  });

  chart.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + spaceForLabels + ", " + -gapBetweenGroups/2 + ")")
        .call(yAxis);

  var legendRectSize = 18,
      legendSpacing  = 4;

  drawLegend(chart, data, color, chartWidth, legendRectSize, legendSpacing, gapBetweenGroups, spaceForLabels);
}

function createChart(idNodeHTML, width, height) {
  d3.select(idNodeHTML).selectAll("svg").remove();
  return d3.select(idNodeHTML).append("svg")
    .attr("width", width)
    .attr("height", height);
}

function createBar(chart, data, functionTransformation) {
  return chart.selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", functionTransformation);
}

function drawRectangles(bar, data, color, functionX, functionY, functionWidth, functionHeight) {
  bar.append("rect")
      .attr("fill", function(d,i) {
        return color(i % data.series.length);
      })
      .attr("class", "bar")
      .attr("y", functionY)
      .attr("width", functionWidth)
      .attr("height", functionHeight);
}

function drawLabels(chart, bar, data, x, y, getTextFunction) {
  bar.append("text")
      .attr("class", "label")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", ".35em")
      .text(getTextFunction);
}

function drawLegend(chart, data, colors, legendSize, legendRectSize, legendSpacing, gapBetweenGroups, spaceForLabels) {

  var legend = chart.selectAll('.legend')
      .data(data.series)
      .enter()
      .append('g')
      .attr('transform', function (d, i) {
          var size = legendRectSize + legendSpacing;
          var offset = -gapBetweenGroups/2;
          var horz = spaceForLabels + legendSize + 40 - legendRectSize;
          var vert = i * size - offset;
          return 'translate(' + horz + ',' + vert + ')';
      });

  legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', function (d, i) { return colors(i); })
      .style('stroke', function (d, i) { return colors(i); });

  legend.append('text')
      .attr('class', 'legend')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function (d) { return d.label; });
}

/**
 * ask to our middleware statistiques of several users. Then draw two graphs.
 * The first represent simply the statistics of each users relatively to the group.
 * The second represent a powerbar that concatenate each stat of a same user. More the bar are powerfull, 
 * better is the name of the race a user gets.
 */
function changeStatsInfo() {
  getUserStats(document.getElementById("seed3").value).then(stats => {

    // Receive and format the data 
    let label = [];
    let nbLines = [];
    let nbCommits = [];
    let nbRepos = [];
    for(let i = 0; i < stats.length; ++i) {
      label.push(stats[i]['username']);
      nbLines.push(stats[i]['nb_lines']);
      nbCommits.push(stats[i]['nb_commit']);
      nbRepos.push(stats[i]['nb_repos']);
    }

    let serie = []
    let serie1 = {
      label: "Nb lignes",
      values: nbLines
    }
    let serie2 = {
      label: "Nb commits",
      values: nbCommits
    }
    let serie3 = {
      label: "Nb repos",
      values: nbRepos
    }
    serie.push(serie1)
    serie.push(serie2)
    serie.push(serie3)

    let data = {
      labels: label,
      series: serie
    }

    drawHorizontalGraph(data, "#service1");
    drawVerticalGraph(data, "#service2");
  });
}