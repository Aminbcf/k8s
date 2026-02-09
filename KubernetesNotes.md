# Kubernetes Notes

> **Note:** `kubectl` manages the clusters and K8s (Kubernetes) creates/orchestrates them.

---

## 1. Core Concepts 

### Cluster vs. Node

**Cluster:** The whole system. It includes:

- Master / control plane components (API server, scheduler, controller manager, etcd).
- Worker nodes that run your apps.

**Node:** A single machine (physical or virtual) in the cluster. Each node has:

- **kubelet:** talks to the master, ensures pods are running.
- **Container runtime:** Docker, containerd, etc.
- **Pods:** your apps run inside these.

**Conclusion:** Nodes != Clusters. A cluster contains one or more nodes.

### Control Plane (Master) vs Worker Node

**Control Plane (Master):**

- Usually runs on its own node.
- Manages the cluster: schedules pods, monitors nodes, handles API requests.

**Worker Node:**

- Runs your application workloads inside pods.
- Controlled by the master.

> In Minikube (single-node), both master and worker components run inside the same VM/container for local convenience.

### Pods

- **Pod:** The smallest deployable unit in Kubernetes.
- Can contain one or more containers (usually one).
- Pods always run on nodes (not on the control plane in production).

### VM vs. Kubernetes Hierarchy

- **VM (Minikube/Driver):** The virtual machine/container where the node runs.
- **Kubernetes:** Software running inside that VM to manage nodes, pods, and containers.

**Hierarchy:**

```
Cluster (Kubernetes)
├─ Control Plane (master components: API server, scheduler, etcd)
├─ Node 1 (worker)
│  └─ Pod 1
│     └─ Container (your app)
│  └─ Pod 2
│     └─ Container
└─ Node 2 (worker)
└─ ...
```

---

## 2. Minikube Setup & Connectivity 

**Starting the cluster:**

```bash
minikube start --driver=Container manager (using docker)
```

**Checking status:**

```bash
minikube status
```

**Checking Node IP:**

```bash
minikube ip
```

**Attempting Direct SSH (Failure):**

Attempting to connect to the node IP directly often fails because it is internal.

```powershell
C:\Users\Amine>ssh docker@192.168.49.2
ssh: connect to host 192.168.49.2 port 22: Connection timed out
```

**Checking Profile List:**

```powershell
C:\Users\Amine>minikube profile list
┌──────────┬────────┬─────────┬──────────────┬─────────┬────────┬───────┬────────────────┬────────────────────┐
│ PROFILE  │ DRIVER │ RUNTIME │      IP      │ VERSION │ STATUS │ NODES │ ACTIVE PROFILE │ ACTIVE KUBECONTEXT │
├──────────┼────────┼─────────┼──────────────┼─────────┼────────┼───────┼────────────────┼────────────────────┤
│ minikube │ docker │ docker  │ 192.168.49.2 │ v1.35.0 │ OK     │ 1     │ * │ * │
└──────────┴────────┴─────────┴──────────────┴─────────┴────────┴───────┴────────────────┴────────────────────┘
```

**Connecting via Minikube SSH (Success):**

```powershell
C:\Users\Amine>minikube ssh
Linux minikube 6.6.87.2-microsoft-standard-WSL2 #1 SMP PREEMPT_DYNAMIC Thu Jun  5 18:30:46 UTC 2025 x86_64
docker@minikube:~$
```

**Inside the Node:**

- `docker ps`: Checks running containers (Docker is the default runtime).
- `exit`: Quits the node.

---

## 3. Basic kubectl Commands 

**Checking Cluster Info:**

```powershell
C:\Users\Amine>kubectl cluster-info
Kubernetes control plane is running at https://127.0.0.1:53579
CoreDNS is running at https://127.0.0.1:53579/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

**Checking Nodes:**

```powershell
C:\Users\Amine>kubectl get nodes
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   17m   v1.35.0
```

**Checking Pods (default namespace):**

```powershell
C:\Users\Amine>kubectl get pods
No resources found in default namespace.
```

**Checking Namespaces (typo check):**

```powershell
C:\Users\Amine>kubectlk get namespaces
'kubectlk' is not recognized as an internal or external command,
operable program or batch file.
```

```powershell
C:\Users\Amine>kubectl get namespaces
NAME              STATUS   AGE
default           Active   25m
kube-node-lease   Active   25m
kube-public       Active   25m
kube-system       Active   25m
```

**Checking System Pods:**

```powershell
C:\Users\Amine>kubectl get pods --namespace=kube-system
NAME                               READY   STATUS    RESTARTS      AGE
coredns-7d764666f9-96hz2           1/1     Running   1 (24m ago)   27m
etcd-minikube                      1/1     Running   1 (24m ago)   27m
kube-apiserver-minikube            1/1     Running   1 (24m ago)   27m
kube-controller-manager-minikube   1/1     Running   1 (24m ago)   27m
kube-proxy-52mc9                   1/1     Running   1 (24m ago)   27m
kube-scheduler-minikube            1/1     Running   1 (24m ago)   27m
storage-provisioner                1/1     Running   3 (24m ago)   27m
```

---

## 4. Creating and Debugging Pods 

**Creating an Nginx Pod:**

```powershell
C:\Users\Amine>kubectl run nginx --image=nginx
pod/nginx created
```

```powershell
C:\Users\Amine>kubectl get pods
NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          106s
```

**Inspecting inside the Node:**

```bash
docker@minikube:~$ docker ps | grep nginx
d50a430705d6   nginx   "/docker-entrypoint.…"   10 minutes ago   Up 10 minutes   k8s_nginx_nginx_default...
```

**Connecting to the Container:**

```bash
docker@minikube:~$ docker exec  -it d50a430705d6 sh
# hostname
nginx
# hostname -i
10.244.0.4
```

**Nginx Welcome Page (HTML Output):**

Inside the container, checking the server response:

```html
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>
...
<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

**Pod Details (wide output):**

```powershell
C:\Users\Amine>kubectl get pods -o wide
NAME    READY   STATUS    RESTARTS   AGE   IP           NODE       NOMINATED NODE   READINESS GATES
nginx   1/1     Running   0          17m   10.244.0.4   minikube   <none>           <none>
```

**Deleting the Pod:**

```bash
kubectl delete pod nginx
```

---

## 5. Deployments & Scaling 

**Alias and Client Version:**

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ alias k="kubectl"

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k version --client
Client Version: v1.34.1
Kustomize Version: v5.7.1
```

**Creating a Deployment:**

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k create deployment nginx-deployment --image=nginx
deployment.apps/nginx-deployment created

$ k get deployment
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   1/1     1            1           7s
```

**Describing the Deployment:**

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k describe deployment nginx-deployment
Name:                   nginx-deployment
Namespace:              default
CreationTimestamp:      Mon, 02 Feb 2026 12:40:47 +0100
Labels:                 app=nginx-deployment
Annotations:            deployment.kubernetes.io/revision: 1
Selector:               app=nginx-deployment
Replicas:               3 desired | 3 updated | 3 total | 3 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=nginx-deployment
  Containers:
   nginx:
    Image:         nginx
    Port:          <none>
    Host Port:     <none>
...
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Progressing    True    NewReplicaSetAvailable
  Available      True    MinimumReplicasAvailable
OldReplicaSets:  <none>
NewReplicaSet:   nginx-deployment-6ff797d4c9 (3/3 replicas created)
```

**Checking Deployment Pods:**

```bash
$ k get pods
NAME                                READY   STATUS    RESTARTS   AGE
nginx-deployment-6ff797d4c9-qlfwr   1/1     Running   0          5m41s
```

**Scaling Up (replicas = 5):**

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k scale deployment nginx-deployment --replicas=5
deployment.apps/nginx-deployment scaled

$ k get pods
NAME                                READY   STATUS             RESTARTS   AGE
nginx-deployment-6ff797d4c9-88h7z   1/1     Running            0          7s
nginx-deployment-6ff797d4c9-b9v2s   1/1     Running            0          7s
nginx-deployment-6ff797d4c9-m6ctw   1/1     Running            0          7s
nginx-deployment-6ff797d4c9-qlfwr   1/1     Running            0          9m47s
nginx-deployment-6ff797d4c9-rwj45   0/1     ContainerCreating  0          7s
```

**Scaling Down (replicas = 3):**

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k scale deployment nginx-deployment --replicas=3
deployment.apps/nginx-deployment scaled
```

**Checking Locations (error handling):**

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k get pods -wide
error: unknown shorthand flag: 'i' in -ide
See 'kubectl get --help' for usage.
```

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k get pods -o wide
NAME                                READY   STATUS    RESTARTS   AGE    IP           NODE       NOMINATED NODE
nginx-deployment-6ff797d4c9-b9v2s   1/1     Running   0          119s   10.244.0.7   minikube   <none>
nginx-deployment-6ff797d4c9-qlfwr   1/1     Running   0          11m    10.244.0.5   minikube   <none>
nginx-deployment-6ff797d4c9-rwj45   1/1     Running   0          119s   10.244.0.9   minikube   <none>
```

---

## 6. Networking & Services 

**Service concept:**

Since pod IPs are internal and change (dynamic), we create a Service to act as a stable endpoint (load balancer or internal mapping).

**Command errors (flag checks):**

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k get deploy --wide
error: unknown flag: --wide
```

**Checking existing services:**

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k get svc
NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   24h
```

**Exposing the deployment:**

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k expose deployment nginx-deployment --port=8080
service/nginx-deployment exposed
```

**Verifying the service:**

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k get services
NAME               TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
kubernetes         ClusterIP   10.96.0.1        <none>        443/TCP    24h
nginx-deployment   ClusterIP   10.111.225.197   <none>        8080/TCP   89s
```

**Access:**

- **Cluster-IP (10.111.225.197):** Use this IP to connect to any pod in the cluster.
- **External Access:** 10.111.225.197:8080 will not work from your Windows PC (host) because the IP is internal to the cluster network. However, it can be accessed from inside any node.

**Services**

**k get svc** in order to return the services of deployment
```bash

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ kubectl get svc
NAME               TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
kubernetes         ClusterIP   10.96.0.1        <none>        443/TCP    7d1h
nginx-deployment   ClusterIP   10.111.225.197   <none>        8080/TCP   6d

Amine@DESKTOP-GUH03V3 MINGW64 ~
$

```
**kubectl describe service nginx-deployment** so we can have more info on specific service

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ kubectl describe service nginx-deployment
Name:                     nginx-deployment
Namespace:                default
Labels:                   app=nginx-deployment
Annotations:              <none>
Selector:                 app=nginx-deployment
Type:                     ClusterIP
IP Family Policy:         SingleStack
IP Families:              IPv4
IP:                       10.111.225.197
IPs:                      10.111.225.197
Port:                     <unset>  8080/TCP
TargetPort:               8080/TCP
Endpoints:                10.244.0.17:8080,10.244.0.16:8080,10.244.0.15:8080
Session Affinity:         None
Internal Traffic Policy:  Cluster
Events:                   <none>
```
**note**:pods are linked thourgh selctor feilds


**Removing a service/deployment** : $ kubectl delete servic nginx-deployment

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ kubectl delete servic nginx-deployment
service "nginx-deployment" deleted from default namespace

Amine@DESKTOP-GUH03V3 MINGW64 ~
$
Amine@DESKTOP-GUH03V3 MINGW64 ~
$kubectl get deploy
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     3            3           7d

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ kubectl get svc
NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   7d1h

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ kubectl get deploy
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     3            3           7d

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ kubectl delete deploy nginx-deployment
deployment.apps "nginx-deployment" deleted from default namespace

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ kubectl get deploy
No resources found in default namespace.

```



---



*File formatted for readability (headings, code blocks, and concise bullet lists) — content unchanged.*