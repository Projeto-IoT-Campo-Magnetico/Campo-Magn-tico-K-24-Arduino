document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('graficoLeituras').getContext('2d');
    const tabelaLeituras = document.getElementById('tabelaLeituras').getElementsByTagName('tbody')[0];
    const filtroEstado = document.getElementById('filtroEstado');
    const filtroPesquisa = document.getElementById('filtroPesquisa');
    
    let chart = null;
    let todasLeituras = [];
    let leiturasFiltradas = [];
    
    // Função para carregar as leituras do servidor
    async function carregarLeituras() {
        try {
            const response = await fetch('/leituras');
            todasLeituras = await response.json();
            aplicarFiltros();
        } catch (erro) {
            console.error('Erro ao carregar leituras:', erro);
        }
    }
    
    // Função para atualizar a tabela com as leituras
    function atualizarTabela(leituras) {
        tabelaLeituras.innerHTML = '';
        
        if (leituras.length === 0) {
            const row = tabelaLeituras.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 3;
            cell.textContent = 'Nenhuma leitura encontrada com os filtros atuais';
            cell.style.textAlign = 'center';
            cell.style.padding = '20px';
            cell.style.color = '#666';
            return;
        }
        
        leituras.forEach(leitura => {
            const row = tabelaLeituras.insertRow();
            row.insertCell(0).textContent = leitura.valor;
            row.insertCell(1).textContent = leitura.estado;
            row.insertCell(2).textContent = new Date(leitura.timestamp).toLocaleString();
        });
    }
    
    // Função para aplicar todos os filtros
    function aplicarFiltros() {
        // Filtro por estado
        let leiturasFiltradas = todasLeituras;
        
        if (filtroEstado.value !== 'TODOS') {
            leiturasFiltradas = leiturasFiltradas.filter(
                leitura => leitura.estado === filtroEstado.value
            );
        }
        
        // Filtro por pesquisa
        const termoPesquisa = filtroPesquisa.value.toLowerCase().trim();
        if (termoPesquisa) {
            leiturasFiltradas = leiturasFiltradas.filter(leitura => {
                // Verifica se o termo está no valor (convertido para string)
                if (leitura.valor.toString().includes(termoPesquisa)) {
                    return true;
                }
                
                // Verifica se o termo está no estado (convertido para minúsculas)
                if (leitura.estado.toLowerCase().includes(termoPesquisa)) {
                    return true;
                }
                
                return false;
            });
        }
        
        // Atualiza a tabela e o gráfico com os resultados filtrados
        atualizarTabela(leiturasFiltradas);
        atualizarGrafico(leiturasFiltradas);
    }
    
    // Função para atualizar o gráfico com personalizações
    function atualizarGrafico(leituras) {
        leituras = [...leituras].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        const labels = leituras.map(leitura => new Date(leitura.timestamp).toLocaleTimeString());
        const data = leituras.map(leitura => leitura.valor);
        
        // Cria um gradiente para o fundo do gráfico
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(75, 192, 192, 0.4)');
        gradient.addColorStop(1, 'rgba(75, 192, 192, 0.1)');
        
        if (chart) {
            chart.destroy();
        }
        
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valor do Sensor',
                    data: data,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: 'rgb(75, 192, 192)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(75, 192, 192)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMax: 1600,
                        title: {
                            display: true,
                            text: 'Valor do Sensor',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            stepSize: 200,
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Horário da Leitura',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            maxTicksLimit: 10,
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                family: "'Helvetica', 'Arial', sans-serif"
                            },
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    title: {
                        display: true,
                        text: 'Leituras do Sensor Magnético',
                        font: {
                            size: 18,
                            weight: 'bold',
                            family: "'Helvetica', 'Arial', sans-serif"
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Valor: ${context.parsed.y}`;
                            },
                            title: function(tooltipItems) {
                                const dataIndex = tooltipItems[0].dataIndex;
                                return new Date(leituras[dataIndex].timestamp).toLocaleString();
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 6,
                        hitRadius: 8
                    },
                    line: {
                        borderWidth: 3
                    }
                },
                interaction: {
                    mode: 'nearest',
                    intersect: false,
                    axis: 'x'
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
    
    // Evento de mudança no filtro de estado
    filtroEstado.addEventListener('change', aplicarFiltros);
    
    // Evento de entrada no campo de pesquisa
    filtroPesquisa.addEventListener('input', aplicarFiltros);
    
    // Inicialização
    carregarLeituras();
    
    // Atualizar a cada 5 segundos
    setInterval(carregarLeituras, 5000);
});