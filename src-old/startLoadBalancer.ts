import LoadBalancer from "./loadBalancer";

const servers = [
    'ws://localhost:8081',
    'ws://localhost:8082',
    'ws://localhost:8083',
];

const loadBalancer = new LoadBalancer(servers);
loadBalancer.start(8080);