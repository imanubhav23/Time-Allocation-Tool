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
        insights.push(`You're investing ${investmentRatio.toFixed(0)}x more time than spending on distractions - great balance!`);
    } else if (investmentRatio < 1) {
        insights.push(`Currently spending ${(1/investmentRatio).toFixed(0)}x more time on distractions than investments - consider rebalancing your time.`);
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
