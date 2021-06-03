import React from 'react';

import { Bar } from 'react-chartjs-2';

export default function BarChart(props) {

    const { bulan, masuk, selesai } = props;


    return (
      <div>
          <Bar
              data={{
                labels : ['Jan 2020', 'Feb 2020', 'Mar 2020',
                'Apr 2020', 'May 2020'],
                  datasets : [
                      {
                          label: 'Masuk',
                          data: [10, 8, 13, 5, 11, 7],
                          backgroundColor: 'green',
                          borderColor: 'gray',
                          borderWidth: 2,
                      },
                      {
                          label: 'Selesai',
                          data: [6, 4, 9, 3, 7, 4],
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