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

    const timeBar = document.getElementById('timeBar');
    timeBar.innerHTML = '';
    
    const colors = {
        investments: '#4CAF50',
        distractions: '#f44336',
        sleep: '#2196F3',
        work: '#FFC107'
    };

    Object.entries(percentages).forEach(([category, percentage]) => {
        if (percentage > 0) {
            const segment = document.createElement('div');
            segment.className = 'progress-segment';
            segment.style.width = `${percentage}%`;
            segment.style.backgroundColor = colors[category];
            segment.textContent = `${category}: ${percentage.toFixed(1)}%`;
            timeBar.appendChild(segment);
        }
    });

    const ratio = distractions / investments;
    const insight = document.getElementById('insight');
    if (distractions > investments) {
        insight.textContent = `You spend ${ratio.toFixed(1)} times more time on distractions than investments.`;
    } else if (investments > distractions) {
        insight.textContent = `You spend ${(1/ratio).toFixed(1)} times more time on investments than distractions.`;
    } else {
        insight.textContent = `Your time is equally split between investments and distractions.`;
    }

    document.getElementById('results').style.display = 'block';
    document.getElementById('content').style.display = 'none';
    
    createTimeVisualization();
    createProjectionChart();;
}

function createTimeVisualization() {
    function collectData() {
        const investments = Array.from(document.querySelectorAll('#investments-list .activity-box'))
            .map(box => ({
                name: box.querySelector('label')?.textContent.replace(':', '') || 
                      box.querySelector('input[type="text"]')?.value || 'Other',
                value: Number(box.querySelector('input[type="number"]').value),
                category: 'Investments'
            }))
            .filter(item => item.value > 0);

        const distractions = Array.from(document.querySelectorAll('#distractions-list .activity-box'))
            .map(box => ({
                name: box.querySelector('label')?.textContent.replace(':', '') || 
                      box.querySelector('input[type="text"]')?.value || 'Other',
                value: Number(box.querySelector('input[type="number"]').value),
                category: 'Distractions'
            }))
            .filter(item => item.value > 0);

        const fixed = Array.from(document.querySelectorAll('.fixed-activities .activity-box'))
            .map(box => ({
                name: box.querySelector('label').textContent.replace(':', ''),
                value: Number(box.querySelector('input[type="number"]').value),
                category: 'Fixed'
            }))
            .filter(item => item.value > 0);

        return [...investments, ...distractions, ...fixed];
    }

    const data = collectData();
    
    const colors = {
        Investments: '#4CAF50',
        Distractions: '#f44336',
        Fixed: '#2196F3'
    };

    const treemap = document.getElementById('timeTreemap');
    treemap.innerHTML = `
        <h2 style="padding: 15px; margin: 0;">Time Distribution</h2>
        <div class="legend">
            ${Object.entries(colors).map(([category, color]) => `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${color}"></div>
                    <span>${category}</span>
                </div>
            `).join('')}
        </div>
        <div style="display: flex; flex-wrap: wrap; padding: 15px;">
            ${data.map(item => `
                <div class="time-box" style="background: ${colors[item.category]}; flex: ${item.value};">
                    <h3>${item.name}</h3>
                    <p>${item.value}h (${((item.value/168)*100).toFixed(1)}%)</p>
                    <div class="percentage-bar">
                        <div class="percentage-fill" 
                             style="width: ${(item.value/168)*100}%; background: rgba(255,255,255,0.3)">
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    const categoryTotals = data.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.value;
        return acc;
    }, {});

    const insights = document.getElementById('timeInsights');
    insights.innerHTML = generateInsights(data, categoryTotals);
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

    const investmentTrend = investmentHours > distractionHours ? -50 : 0;
    const distractionTrend = distractionHours > investmentHours ? 50 : 0;

    for (let i = 1; i < 7; i++) {
        const lastInvestment = projectedData.investmentHours[i-1];
        const lastDistraction = projectedData.distractionHours[i-1];
        
        projectedData.investmentHours.push(Math.max(0, lastInvestment + (investmentTrend * i)));
        projectedData.distractionHours.push(Math.max(0, lastDistraction + (distractionTrend * i)));
    }

    const ctx = document.getElementById('projectionChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: projectedData.labels,
            datasets: [
                {
                    label: 'Total Investment Hours',
                    data: projectedData.investmentHours,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    borderWidth: 2,
                    borderDash: [5, 5]
                },
                {
                    label: 'Total Distraction Hours',
                    data: projectedData.distractionHours,
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.2)',
                    borderWidth: 2,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Total Hours Accumulated Over 6 Months'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} hours`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Total Accumulated Hours'
                    }
                }
            }
        }
    });
}
function generateInsights(data, categoryTotals) {
    const insights = [];
    
    const investmentRatio = categoryTotals['Investments'] / categoryTotals['Distractions'];
    if (investmentRatio > 1) {
        insights.push(`You're investing ${investmentRatio.toFixed(1)}x more time than spending on distractions - great balance!`);
    } else if (investmentRatio < 1) {
        insights.push(`Consider rebalancing your time - currently spending ${(1/investmentRatio).toFixed(1)}x more time on distractions than investments.`);
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
                    <span>${hours}h (${((hours/168)*100).toFixed(1)}%)</span>
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
        createTimeVisualization();
        createProjectionChart();    }
});
