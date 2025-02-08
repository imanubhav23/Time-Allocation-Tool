function startTool() {
    document.getElementById('content').style.display = 'block';
    document.querySelector('.landing').style.display = 'none';
    updateTotal();
}

function updateTotal() {
    const investments = Array.from(document.querySelectorAll('#investments-list input[type="number"]'))
        .reduce((sum, input) => sum + Number(input.value), 0);
    
    const distractions = Array.from(document.querySelectorAll('#distractions-list input[type="number"]'))
        .reduce((sum, input) => sum + Number(input.value), 0);
    
    const fixed = Array.from(document.querySelectorAll('.fixed-activities input[type="number"]'))
        .reduce((sum, input) => sum + Number(input.value), 0);

    const total = investments + distractions + fixed;
    let totalHoursSpan = document.getElementById('totalHoursSpent');
    if (!totalHoursSpan) {
        totalHoursSpan = document.createElement('span');
        totalHoursSpan.id = 'totalHoursSpent';
        totalHoursSpan.style.display = 'none';
        document.body.appendChild(totalHoursSpan);
    }
    
    totalHoursSpan.textContent = total;    
    const errorMessage = document.getElementById('error-message');
    const calculateBtn = document.querySelector('.calculate-btn');
    
    if (total !== 168) {
        errorMessage.style.display = 'block';
        calculateBtn.disabled = true;
        calculateBtn.style.opacity = '0.5';
        if (total > 168) {
            errorMessage.textContent = `You've allocated ${total} hours. Please reduce by ${total - 168} hours to proceed.`;
        } else {
            errorMessage.textContent = `You've allocated ${total} hours. Please add ${168 - total} more hours to proceed.`;
        }
    } else {
        errorMessage.style.display = 'none';
        calculateBtn.disabled = false;
        calculateBtn.style.opacity = '1';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const allInputs = document.querySelectorAll('input[type="number"]');
    allInputs.forEach(input => {
        input.setAttribute('max', '168');
        input.addEventListener('input', function() {
            if (this.value > 168) {
                this.value = 168;
            }
            if (this.value < 0) {
                this.value = 0;
            }
            updateTotal();
        });
    });
    updateTotal();
});

function addNewActivity(listId) {
    const list = document.getElementById(listId);
    const newBox = document.createElement('div');
    newBox.className = 'activity-box';
    
    const input = document.createElement('div');
    input.className = 'activity-input';
    
    input.innerHTML = `
        <input type="text" placeholder="Enter activity name" style="font-size: var(--font-size);">
        <input type="number" min="0" max="168" value="0" style="font-size: var(--font-size);">
        <span style="font-size: var(--font-size);">hours/week</span>
    `;
    
    newBox.appendChild(input);
    list.appendChild(newBox);
    
    const numberInput = input.querySelector('input[type="number"]');
    numberInput.addEventListener('input', function() {
        if (this.value > 168) {
            this.value = 168;
        }
        if (this.value < 0) {
            this.value = 0;
        }
        updateTotal();
    });
}

function calculateResults() {
    let totalHoursSpan = document.getElementById('totalHoursSpent');
    if (!totalHoursSpan) {
        totalHoursSpan = document.createElement('span');
        totalHoursSpan.id = 'totalHoursSpent';
        totalHoursSpan.style.display = 'none';
        document.body.appendChild(totalHoursSpan);
    }
        
    const total = Number(document.getElementById('totalHoursSpent').textContent);
    if (total !== 168) {
        const errorMessage = document.getElementById('error-message');
        console.log('Total hours:', total);
        errorMessage.style.display = 'block';
        errorMessage.textContent = total > 168 ? 
            `You've allocated ${total} hours. Please reduce by ${total - 168} hours to proceed.` :
            `You've allocated ${total} hours. Please add ${168 - total} more hours to proceed.`;
        return;
    }

    const investments = Array.from(document.querySelectorAll('#investments-list input[type="number"]'))
        .reduce((sum, input) => sum + Number(input.value), 0);
    
    const distractions = Array.from(document.querySelectorAll('#distractions-list input[type="number"]'))
        .reduce((sum, input) => sum + Number(input.value), 0);
    
    const sleep = Number(document.querySelector('.fixed-activities input[value="56"]').value);
    const work = Number(document.querySelector('.fixed-activities input[value="40"]').value);
    
    // Collect all detailed data for insights
    const data = [
        ...Array.from(document.querySelectorAll('#investments-list .activity-box')).map(box => ({
            name: box.querySelector('label')?.textContent.replace(':', '') || 
                  box.querySelector('input[type="text"]')?.value || 'Other Investment',
            value: Number(box.querySelector('input[type="number"]').value)
        })),
        ...Array.from(document.querySelectorAll('#distractions-list .activity-box')).map(box => ({
            name: box.querySelector('label')?.textContent.replace(':', '') || 
                  box.querySelector('input[type="text"]')?.value || 'Other Distraction',
            value: Number(box.querySelector('input[type="number"]').value)
        }))
    ];

    const categoryTotals = {
        'Investments': investments,
        'Distractions': distractions,
        'Work': work,
        'Sleep': sleep
    };

    const ratio = distractions / investments;
    const insight = document.getElementById('insight');
    if (distractions > investments) {
        insight.textContent = `You spend ${ratio.toFixed(0)} times more time on distractions than investments.`;
    } else if (investments > distractions) {
        insight.textContent = `You spend ${(1/ratio).toFixed(0)} times more time on investments than distractions.`;
    } else {
        insight.textContent = `Your time is equally split between investments and distractions.`;
    }

    document.getElementById('results').style.display = 'block';
    document.getElementById('content').style.display = 'none';

attachTimeReallocationSliders();


    // Add insights to the page
    document.getElementById('timeInsights').innerHTML = generateInsights(data, categoryTotals);
    
    createHorizontalBarChart();
    createProjectionChart();
}
function createProjectionChart() {
    const chartContainer = document.createElement('div');
    chartContainer.id = 'projectionChartContainer';
    chartContainer.style.width = '50%';
    chartContainer.style.height = '200px';
    chartContainer.style.display = 'inline-block';
    // chartContainer.style.verticalAlign = 'top';
    
    const canvas = document.createElement('canvas');
    canvas.id = 'projectionChart';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    chartContainer.appendChild(canvas);
    
    const vizContainer = document.querySelector('.viz-container');
    vizContainer.appendChild(chartContainer);

    function collectProjectionData() {
        const investments = Array.from(document.querySelectorAll('#investments-list .activity-box'))
            .filter(box => box.querySelector('label')?.textContent !== 'Work:')
            .map(box => ({
                name: box.querySelector('label')?.textContent.replace(':', '') || 
                      box.querySelector('input[type="text"]')?.value || 'Other Investment',
                value: Number(box.querySelector('input[type="number"]').value)
            }));

        const distractions = Array.from(document.querySelectorAll('#distractions-list .activity-box'))
            .map(box => ({
                name: box.querySelector('label')?.textContent.replace(':', '') || 
                      box.querySelector('input[type="text"]')?.value || 'Other Distraction',
                value: Number(box.querySelector('input[type="number"]').value)
            }));

        const investmentHours = investments.reduce((sum, item) => sum + item.value, 0);
        const distractionHours = distractions.reduce((sum, item) => sum + item.value, 0);

        return {
            investmentHours,
            distractionHours
        };
    }

    const { investmentHours, distractionHours } = collectProjectionData();

    // Projection calculation (total hours over 6 months)
    const projectedData = {
        labels: ['Current', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
        investmentHours: [investmentHours],
        distractionHours: [distractionHours]
    };

    // Calculate accumulated hours
    const weeksInMonth = 4.33; // average number of weeks in a month
    const monthlyInvestmentHours = investmentHours * weeksInMonth;
    const monthlyDistractionHours = distractionHours * weeksInMonth;

    for (let i = 1; i < 7; i++) {
        projectedData.investmentHours.push(monthlyInvestmentHours * i);
        projectedData.distractionHours.push(monthlyDistractionHours * i);
    }

    const ctx = document.getElementById('projectionChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: projectedData.labels,
            datasets: [
                {
                    label: 'Accumulated Investment Hours',
                    data: projectedData.investmentHours,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Accumulated Distraction Hours',
                    data: projectedData.distractionHours,
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.2)',
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Accumulated Hours Over 6 Months'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(0)} hours`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Total Accumulated Hours'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function generateInsights(data, categoryTotals) {
    const insights = [];
    
    const investmentRatio = categoryTotals['Investments'] / categoryTotals['Distractions'];
    if (investmentRatio > 1) {
        insights.push(`You're investing ${investmentRatio.toFixed(0)} x more time than spending on distractions - great balance!`);
    } else if (investmentRatio < 1) {
        insights.push(`Currently spending ${(1/investmentRatio).toFixed(0)} x more time on distractions than investments - consider rebalancing your time.`);
    }
    const topActivities = [...data].sort((a, b) => b.value - a.value).slice(0, 3);
    insights.push(`Your top time commitments are: ${topActivities.map(a => `${a.name} (${a.value}h)`).join(', ')}`);

    return `
        <div class="summary" style="margin-top: 15px;">
            <h3>Key Insights</h3>
            ${insights.map(insight => `<p style="margin: 10px 0;">${insight}</p>`).join('')}
        </div>
    `;
}

window.addEventListener('resize', () => {
    if (document.getElementById('results').style.display === 'block') {
        createProjectionChart();
        createHorizontalBarChart();
    }
});

function createHorizontalBarChart() {
    const chartContainer = document.createElement('div');
    chartContainer.id = 'horizontalBarChartContainer';
    chartContainer.style.width = '50%';
    chartContainer.style.height = '200px';
    chartContainer.style.display = 'inline-block';
    
    const canvas = document.createElement('canvas');
    canvas.id = 'horizontalBarChart';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    chartContainer.appendChild(canvas);
    
    const vizContainer = document.querySelector('.viz-container');
    vizContainer.appendChild(chartContainer);

    const investments = Array.from(document.querySelectorAll('#investments-list .activity-box'))
        .map(box => ({
            name: box.querySelector('label')?.textContent.replace(':', '') || 
                  box.querySelector('input[type="text"]')?.value || 'Other Investment',
            hours: Number(box.querySelector('input[type="number"]').value)
        })).filter(item => item.hours > 0);

    const distractions = Array.from(document.querySelectorAll('#distractions-list .activity-box'))
        .map(box => ({
            name: box.querySelector('label')?.textContent.replace(':', '') || 
                  box.querySelector('input[type="text"]')?.value || 'Other Distraction',
            hours: Number(box.querySelector('input[type="number"]').value)
        })).filter(item => item.hours > 0);

    const sleep = Number(document.querySelector('.fixed-activities input[value="56"]').value);
    const work = Number(document.querySelector('.fixed-activities input[value="40"]').value);

    const colorScheme = {
        Investments: {
            backgroundColor: 'rgba(76, 175, 80, 0.2)',    // Light green
            borderColor: '#4CAF50',  // Dark green
            description: 'Growth-oriented activities'
        },
        Distractions: {
            backgroundColor: 'rgba(244, 67, 54, 0.2)',    // Light red
            borderColor: '#f44336',  // Dark red
            description: 'Non-growth activities'
        },
        Work: {
            backgroundColor: 'rgba(255, 193, 7, 0.2)',    // Light yellow
            borderColor: '#FFC107',  // Dark yellow
            description: 'Productive work'
        },
        Sleep: {
            backgroundColor: 'rgba(33, 150, 243, 0.2)',    // Light blue
            borderColor: '#2196F3',  // Dark blue
            description: 'Rest and recovery'
        }
    };

    const ctx = document.getElementById('horizontalBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        indexAxis: 'y',
        data: {
            labels: ['Investments', 'Distractions', 'Work', 'Sleep'],
            datasets: [{
                data: [
                    investments.reduce((sum, item) => sum + item.hours, 0),
                    distractions.reduce((sum, item) => sum + item.hours, 0),
                    work,
                    sleep
                ],
                backgroundColor: [
                    colorScheme.Investments.backgroundColor,
                    colorScheme.Distractions.backgroundColor,
                    colorScheme.Work.backgroundColor,
                    colorScheme.Sleep.backgroundColor
                ],
                borderColor: [
                    colorScheme.Investments.borderColor,
                    colorScheme.Distractions.borderColor,
                    colorScheme.Work.borderColor,
                    colorScheme.Sleep.borderColor
                ],
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Weekly Time Allocation Breakdown',
                },
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: true,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    titleColor: 'black',
                    bodyColor: 'black',
                    borderColor: 'rgba(0,0,0,0.2)',
                    borderWidth: 1,
                    callbacks: {
                        title: function(context) {
                            const label = context[0].label;
                            return `${label} - ${colorScheme[label].description}`;
                        },
                        label: function(context) {
                            const label = context.label;
                            const value = context.parsed.x;
                            const percentage = ((value / 168) * 100).toFixed(1);
                            
                            // Custom tooltip content for Investments and Distractions
                            if (label === 'Investments') {
                                return [
                                    `Total: ${value}h (${percentage}%)`,
                                    '---',
                                    ...investments.map(item => 
                                        `• ${item.name}: ${item.hours}h (${((item.hours/168)*100).toFixed(1)}%)`
                                    )
                                ];
                            }
                            
                            if (label === 'Distractions') {
                                return [
                                    `Total: ${value}h (${percentage}%)`,
                                    '---',
                                    ...distractions.map(item => 
                                        `• ${item.name}: ${item.hours}h (${((item.hours/168)*100).toFixed(1)}%)`
                                    )
                                ];
                            }
                            
                            return `${value}h (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    max: 168,
                    title: {
                        display: true,
                        text: 'Hours per Week'
                    }
                }
            }
        }
    });
}

function createTimeReallocationSliders() {
    const container = document.getElementById('reallocation-sliders');
    container.innerHTML = `
       <div class="grid grid-cols-2 gap-6">
            <div class="bg-gray-100 p-6 rounded-lg shadow-sm">
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-2">
                        <span>If you were to re-allocate 
                            <span class="reallocation-number-bg">
                                <span id="reallocationValue">10</span>
                            </span>% of distractions to investments
                        </span>
                    </div>
                    <input 
                        type="range" 
                        id="reallocationSlider"
                        min="0" 
                        max="100" 
                        value="10"
                        step="10"
                        class="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-red"
                    >
                    <div class="h-4"></div>
                </div>
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-2">
                        <span>In 
                            <span class="reallocation-number-bg">
                                <span id="yearsValue">1</span>
                            </span> 
                            year(s), you'd save...
                        </span>
                    </div>
                    <input 
                        type="range" 
                        id="yearsSlider"
                        min="0" 
                        max="10" 
                        value="1"
                        step="1"
                        class="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-red"
                    >
                </div>
                <div class="text-center bg-white p-4 rounded-lg shadow-sm saved-time-box">
                    <p id="savedTimeOutput" class="saved-time-text">Saved Time Will Be Calculated Here</p>
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="text-xl font-bold mb-4">With that many hours, you could...</h3>
                <div class="space-y-4">
                    <p>You can walk 
                        <span class="reallocation-number-bg">
                            <span id="walkingDistance">0</span>
                        </span> kilometers, equivalent to crossing 
                        <span class="reallocation-number-bg">
                            <span id="countriesCrossed">0</span>
                        </span> countries.
                    </p>
                    <p>You can master 
                        <span class="reallocation-number-bg">
                            <span id="musicalInstruments">0</span>
                        </span> musical instruments.
                    </p>
                    <p>You can learn 
                        <span class="reallocation-number-bg">
                            <span id="languagesLearned">0</span>
                        </span> new language(s).
                    </p>
                </div>
            </div>
        </div>
    `;
    

    const reallocationSlider = container.querySelector('#reallocationSlider');
    const yearsSlider = container.querySelector('#yearsSlider');
    const reallocationValue = container.querySelector('#reallocationValue');
    const yearsValue = container.querySelector('#yearsValue');
    const savedTimeOutput = container.querySelector('#savedTimeOutput');

    // New elements for insights
    const walkingDistance = container.querySelector('#walkingDistance');
    const countriesCrossed = container.querySelector('#countriesCrossed');
    const musicalInstruments = container.querySelector('#musicalInstruments');
    const languagesLearned = container.querySelector('#languagesLearned');

    function calculateSavedTime() {
        const distractionHours = Array.from(document.querySelectorAll('#distractions-list input[type="number"]'))
            .reduce((sum, input) => sum + Number(input.value), 0);
        
        const weeklyHoursSaved = (distractionHours * reallocationSlider.value) / 100;
        const totalHoursSaved = weeklyHoursSaved * 52 * yearsSlider.value;
        const totalDaysSaved = Math.floor(totalHoursSaved / 24);
        
        savedTimeOutput.innerHTML = `<strong>${Math.floor(totalHoursSaved)} hours ≈ ${totalDaysSaved} days</strong>`;

        // Calculations for insights
        // Assuming average walking speed of 5 km/h and 3-hour practice for mastering an instrument
        walkingDistance.textContent = Math.round(totalHoursSaved * 5);
        countriesCrossed.textContent = Math.round((totalHoursSaved * 5) / 500); // Assuming average country width
        musicalInstruments.textContent = Math.round(totalHoursSaved / 500); // 500 hours to master an instrument
        languagesLearned.textContent = Math.round(totalHoursSaved / 600); // 600 hours to learn a language
    }

    reallocationSlider.addEventListener('input', () => {
    reallocationValue.textContent = reallocationSlider.value;
    calculateSavedTime();
});

    yearsSlider.addEventListener('input', () => {
    yearsValue.textContent = yearsSlider.value;
    calculateSavedTime();
});

calculateSavedTime();
}

// Call this after results are displayed
function attachTimeReallocationSliders() {
    if (document.getElementById('results').style.display === 'block') {
        createTimeReallocationSliders();
    }
}

// Add event listeners for touch events to improve mobile interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Prevent double-tap zoom on inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('touchend', function(e) {
            e.preventDefault();
        });
    });

    // Ensure sliders work smoothly on mobile
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.addEventListener('touchmove', function(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.getBoundingClientRect();
            const percent = (touch.clientX - rect.left) / rect.width;
            this.value = percent * (this.max - this.min) + Number(this.min);
            this.dispatchEvent(new Event('input'));
        });
    });
});
