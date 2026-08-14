const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

dns.resolveSrv(
  "_mongodb._tcp.hrm-cluster.tlavq2m.mongodb.net",
  (error, addresses) => {
    if (error) {
      console.error("DNS ERROR:", error);
      return;
    }

    console.log("MongoDB SRV records:");
    console.log(addresses);
  }
);