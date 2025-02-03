export function printHeader(
  packetType,
  versionLength,
  version,
  sequence,
  payloadLength,
  inOut = '',
) {
  if (inOut === 'in') console.log('------------- 받는 값 -------------');
  else if (inOut === 'out') console.log('------------- 주는 값 -------------');
  else console.log('------------- 헤더 -------------');
  console.log('type:', packetType);
  console.log('versionLength:', versionLength);
  console.log('version:', version);
  console.log('sequence:', sequence);
  console.log('payloadLength:', payloadLength);
  console.log('-------------------------------');
}
