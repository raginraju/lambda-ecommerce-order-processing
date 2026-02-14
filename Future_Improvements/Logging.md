#  Grafana on your Mac -  COMPLETED

```bash
brew install grafana
```

Start the service: 

```bash
brew services start grafana
brew services stop grafana
brew services list
```
Open http://localhost:3000  (login: admin/laptop pass).

Add CloudWatch as a data source and use your ap-southeast-1 region.