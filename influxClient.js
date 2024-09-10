import { InfluxDB, Point } from '@influxdata/influxdb-client';

const token = process.env.INFLUXDB_TOKEN;
const url = 'http://localhost:8086'; // Replace with your InfluxDB URL if different

const client = new InfluxDB({ url, token });

const org = 'YourOrganizationName'; // Replace with your organization name
const bucket = 'ethereum_deposits';  // Replace with your bucket name

const writeApi = client.getWriteApi(org, bucket, 'ns'); // 'ns' is for nanosecond precision
const queryApi = client.getQueryApi(org);

export const writeDepositToInflux = (deposit) => {
  const point = new Point('deposit')
    .tag('hash', deposit.hash)
    .tag('pubkey', deposit.pubkey)
    .floatField('amount', deposit.amount)
    .intField('blockNumber', deposit.blockNumber)
    .intField('blockTimestamp', deposit.blockTimestamp);

  writeApi.writePoint(point);
  writeApi.flush();
};

export const queryData = async () => {
  const fluxQuery = `from(bucket: "${bucket}")
    |> range(start: -10m)
    |> filter(fn: (r) => r._measurement == "deposit")`;

  try {
    await queryApi.queryRows(fluxQuery, {
      next: (row, tableMeta) => {
        const tableObject = tableMeta.toObject(row);
        console.log(tableObject);
      },
      error: (error) => {
        console.error('\nError', error);
      },
      complete: () => {
        console.log('\nSuccess');
      }
    });
  } catch (error) {
    console.error('Query error:', error);
  }
};
