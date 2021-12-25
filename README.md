# Xfinity Data Tracker

Simple tool that uses [Puppeteer](https://developers.google.com/web/tools/puppeteer/) to retrieve the current data usage for your Xfinity account and produce a record on MQTT to be consumed by a third-party such as [Home Assistant](https://www.home-assistant.io/)

### Example Home Assistant Configuration

```
  - platform: mqtt
    name: 'Internet Data Usage'
    state_class: total_increasing
    state_topic: 'internet/usage'
    unit_of_measurement: GB
  - platform: statistics
    name: 'Internet Data Usage in Last 24 Hours'
    entity_id: sensor.internet_data_usage
    state_characteristic: change
    max_age:
      hours: 24
```