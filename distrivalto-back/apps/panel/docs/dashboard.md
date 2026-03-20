# Dashboard

GET /api/admin/dashboard/
  Auth: admin required
  Returns: { kpis, trend[], geoConsultas[], geoGarantias[], productConsultas[], topGarantiaProducts[], resolution[] }
  Errors: 403 not admin
