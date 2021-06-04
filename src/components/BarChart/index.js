import React from 'react';

import { Bar } from 'react-chartjs-2';

export default function BarChart(props) {

    const { namaBulan, masuk, selesai } = props;


    return (
        <div>
            <Bar
                data={{
                    labels : namaBulan,
                    datasets : [
                        {
                            label: 'Masuk',
                            data: masuk,
                            backgroundColor: 'green',
                            borderColor: 'gray',
                            borderWidth: 2,
                        },
                        {
                            label: 'Selesai',
                            data: selesai,
                            backgroundColor: 'purple',
                            borderColor: 'gray',
                            borderWidth: 2,
                        }
                    ]
                }}
                height={200}
                width={300}
                options={{
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            }
                        }]
                    },
                }}

            />
        </div>
    );
}