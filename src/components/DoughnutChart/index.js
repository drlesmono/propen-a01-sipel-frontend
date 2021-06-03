import React from 'react';

import { Doughnut } from 'react-chartjs-2';

export default function DoughnutChart(props) {

    const { bulan, masuk, selesai } = props;


    return (
        <div>
            <Doughnut
                data={{
                    labels : ['Tepat Waktu', 'Telat'],
                    datasets : [
                        {
                            label: 'Project Installation',
                            data: [10, 8],
                            backgroundColor: ['green', 'red'],
                            borderColor: 'gray',
                            borderWidth: 2,
                        },
                    ]
                }}
                height={200}
                width={300}
                options={{
                    maintainAspectRatio: false,
                    cutout: '75%',
                }}

            />
        </div>
    );
}