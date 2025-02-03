function startTool() {
    document.getElementById('content').style.display = 'block';
    document.querySelector('.landing').style.display = 'none';
}

function updateTotal() {
    const investments = Array.from(document.querySelectorAll('#investments-list input[type="number"]'))
        .reduce((sum, input) => sum + Number(input.value), 0);
    
    const distractions = Array.from(document.querySelectorAll('#distractions-list input[type="number"]'))
        .reduce((sum, input) => sum + Number(input.value), 0);
    
    const fixed = Array.from(document.querySelectorAll('.fixed-activities input[type="number"]'))
        .reduce((sum, input) => sum + Number(input.value), 0);

    const total = investments + distractions + fixed;
    document.getElementById('totalHoursSpent').textContent = total;
    
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
    const total = Number(document.getElementById('totalHoursSpent').textContent);
    if (total !== 168) {
        const errorMessage = document.getElementById('error-message');
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
    
    const percentages = {
        investments: (investments / 168) * 100,
        distractions: (distractions / 168) * 100,
        sleep: (sleep / 168) * 100,
        work: (work / 168) * 100
    };

 // Collect subcategory details
const subcategories = {
    investments: Array.from(document.querySelectorAll('#investments-list .activity-box')).map(box => ({
        name: box.querySelector('label')?.textContent.replace(':', '') || 
              box.querySelector('input[type="text"]')?.value || 'Other',
        hours: Number(box.querySelector('input[type="number"]').value)
    })).filter(item => item.hours > 0),
    
    distractions: Array.from(document.querySelectorAll('#distractions-list .activity-box')).map(box => ({
        name: box.querySelector('label')?.textContent.replace(':', '') || 
              box.querySelector('input[type="text"]')?.value || 'Other',
        hours: Number(box.querySelector('input[type="number"]').value)
    })).filter(item => item.hours > 0),
    
    sleep: [{name: 'Sleep', hours: Number(document.querySelector('.fixed-activities input[value="56"]').value)}],
    work: [{name: 'Work', hours: Number(document.querySelector('.fixed-activities input[value="40"]').value)}]
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
    
    createProjectionChart();
    createHorizontalBarChart();
}

function createProjectionChart() {
    const chartContainer = document.createElement('div');
    chartContainer.id = 'projectionChartContainer';
    chartContainer.style.width = '100%';
    chartContainer.style.height = '400px';
    chartContainer.style.marginTop = '20px';
    
    const canvas = document.createElement('canvas');
    canvas.id = 'projectionChart';
    chartContainer.appendChild(canvas);
    
    document.querySelector('.viz-container').appendChild(chartContainer);

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
        insights.push(`Consider rebalancing your time - currently spending ${(1/investmentRatio).toFixed(0)}x more time on distractions than investments.`);
    }

    insights.push(`You have successfully allocated all 168 hours of your week.`);

    const topActivities = [...data].sort((a, b) => b.value - a.value).slice(0, 3);
    insights.push(`Your top time commitments are: ${topActivities.map(a => `${a.name} (${a.value}h)`).join(', ')}`);

    return `
        <div class="summary">
            <h3>Weekly Overview</h3>
            ${Object.entries(categoryTotals).map(([category, hours]) => `
                <div class="metric">
                    <span>${category}</span>
                    <span>${hours}h (${((hours/168)*100).toFixed(0)}%)</span>
                </div>
            `).join('')}
            <div class="metric" style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
                <strong>Total Time</strong>
                <strong>168h</strong>
            </div>
        </div>
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
    chartContainer.style.width = '100%';
    chartContainer.style.height = '300px';
    chartContainer.style.marginTop = '20px';
    
    const canvas = document.createElement('canvas');
    canvas.id = 'horizontalBarChart';
    chartContainer.appendChild(canvas);
    
    // Insert the chart container before the projection chart
    const vizContainer = document.querySelector('.viz-container');
    vizContainer.insertBefore(chartContainer, vizContainer.firstChild);

    // Collect data for the chart
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

    const ctx = document.getElementById('horizontalBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'horizontalBar',
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
                    '#4CAF50',  // Green for Investments
                    '#f44336',  // Red for Distractions
                    '#FFC107',  // Yellow for Work
                    '#2196F3'   // Blue for Sleep
                ]
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label;
                            const value = context.parsed.x;
                            const percentage = ((value / 168) * 100).toFixed(1);
                            
                            // Custom tooltip content
                            if (label === 'Investments') {
                                const detailHTML = investments.map(item => 
                                    `${item.name}: ${item.hours}h (${((item.hours/168)*100).toFixed(1)}%)`
                                ).join('<br>');
                                return `${value}h (${percentage}%)<br>${detailHTML}`;
                            }
                            
                            if (label === 'Distractions') {
                                const detailHTML = distractions.map(item => 
                                    `${item.name}: ${item.hours}h (${((item.hours/168)*100).toFixed(1)}%)`
                                ).join('<br>');
                                return `${value}h (${percentage}%)<br>${detailHTML}`;
                            }
                            
                            return `${value}h (${percentage}%)`;
                        }
                    }
                },
                legend: {
                    display: false
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
