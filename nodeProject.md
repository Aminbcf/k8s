## We built the image now we need to add it to deployment

**kubectl create deployment k8sweb --image=aminebcf/k8sweb**

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$kubectl create deployment k8sweb --image=aminebcf/k8sweb
deployment.apps/k8sweb created

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ kubectl get pods
NAME                      READY   STATUS    RESTARTS   AGE
k8sweb-5ccc755c8c-k54qf   1/1     Running   0          35s

Amine@DESKTOP-GUH03V3 MINGW64 ~
$
```

Now we will expose the webserver

**We creat the ip cluster so we can connect**

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ kubectl expose deployment k8sweb --port=3000
service/k8sweb exposed

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ kubectl get svc
NAME         TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)    AGE
k8sweb       ClusterIP   10.99.53.49   <none>        3000/TCP   10s
kubernetes   ClusterIP   10.96.0.1     <none>        443/TCP    7d2h

Amine@DESKTOP-GUH03V3 MINGW64 ~
$
```
**Now we will try connecting to it**

```bash

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ **kubectl get svc**
NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
k8sweb       ClusterIP   10.106.157.192   <none>        3000/TCP   23s
kubernetes   ClusterIP   10.96.0.1        <none>        443/TCP    9d

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ **minikube ip**
192.168.49.2

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ ssh docker@192.168.49.2
ssh: connect to host 192.168.49.2 port 22: Connection timed out

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ **minikube ssh**
Linux minikube 6.6.87.2-microsoft-standard-WSL2 #1 SMP PREEMPT_DYNAMIC Thu Jun  5 18:30:46 UTC 2025 x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
docker@minikube:~$ curl  10.106.157.192:3000
**curl  10.106.157.192:3000**
Hello from k8sweb-5ccc755c8c-9w2cl!docker@minikube:~$
```

i recived the hello that mean we connected , i had an issue with the port but it was fixed , it's important to note we can connect to it only from inside minikube

## We are gonna scale it now

```bash

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k scale deployment k8sweb --replicas=4
deployment.apps/k8sweb scaled

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k get pods
NAME                      READY   STATUS              RESTARTS   AGE
k8sweb-5ccc755c8c-6zlgr   0/1     ContainerCreating   0          9s
k8sweb-5ccc755c8c-9w2cl   1/1     Running             0          13m
k8sweb-5ccc755c8c-sgwnz   1/1     Running             0          9s
k8sweb-5ccc755c8c-w42r2   1/1     Running             0          9s
```

**after scaling k8s will decide each time to give the request to what instance (he will balance the load)**

```bash
docker@minikube:~$ curl 10.106.157.192:3000; echo
curl 10.106.157.192:3000; echo
Hello from k8sweb-5ccc755c8c-6zlgr!
docker@minikube:~$ curl 10.106.157.192:3000; echo
curl 10.106.157.192:3000; echo
**Hello from k8sweb-5ccc755c8c-6zlgr!**
docker@minikube:~$ curl 10.106.157.192:3000; echo
curl 10.106.157.192:3000; echo
**Hello from k8sweb-5ccc755c8c-9w2cl!**
docker@minikube:~$ curl 10.106.157.192:3000; echo
curl 10.106.157.192:3000; echo
**Hello from k8sweb-5ccc755c8c-w42r2!**
docker@minikube:~$
```


we are gonna change the service type now to node port

```bash
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k delete svc k8sweb
service "k8sweb" deleted from default namespace

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k get svc
NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   9d

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k expose deployment k8sweb --type=NodePort --port=3000
service/k8sweb exposed

Amine@DESKTOP-GUH03V3 MINGW64 ~
$ k get svc
NAME         TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)          AGE
k8sweb       NodePort    10.109.7.71   <none>        3000:30406/TCP   4s
kubernetes   ClusterIP   10.96.0.1     <none>        443/TCP          9d

```
now we kan see that the node added somthing in the port section randomly 3000:30406/TCP 
Now we can connect using node ip adress

now we should be able to connect from out browser using ip adress of minikube:NodePort

it should have worked but there is some issues we will fix it : 

## Issue Summary
Environment:

-Windows

-Minikube using Docker driver

-Service type: NodePort

**Problem:**

```bash
Accessing the app using:

http://<minikube-ip>:<nodeport>
```

did NOT work.

Example:

http://192.168.49.2:30406


Test-NetConnection showed:

PingSucceeded : False
TcpTestSucceeded : False

## Root Cause

When using Minikube with Docker driver on Windows:

Minikube runs inside a Docker network

The Node IP (192.168.49.x) exists inside Docker

Windows cannot directly route to that internal Docker network

So:

Windows  cannot reach 192.168.49.2


Even though:

Pod is running 

Service is correct 

Internal curl works 

This is a networking limitation of Docker driver on Windows.

## Solution Used

Instead of using NodePort IP, we used:

kubectl port-forward svc/k8sweb 3000:3000


Then accessed:

http://localhost:3000

Why This Works

kubectl port-forward creates a direct tunnel:

Your PC (localhost:3000)
        ↓
kubectl tunnel
        ↓
Service
        ↓
Pod


It bypasses:

Node IP

Docker network routing

Windows firewall issues

## Final Conclusion

On Windows + Minikube (Docker driver):

NodePort via Minikube IP may not work
kubectl port-forward is the reliable method

it is important to node that port forwading will only forward to a single pod so the hostname won't change

**another way to test which is simpler**
we use minikube service serviceName
```
Amine@DESKTOP-GUH03V3 MINGW64 ~
$ minikube service k8sweb
┌───────────┬────────┬─────────────┬───────────────────────────┐
│ NAMESPACE │  NAME  │ TARGET PORT │            URL            │
├───────────┼────────┼─────────────┼───────────────────────────┤
│ default   │ k8sweb │ 3000        │ http://192.168.49.2:30406 │
└───────────┴────────┴─────────────┴───────────────────────────┘
* Starting tunnel for service k8sweb.
┌───────────┬────────┬─────────────┬────────────────────────┐
│ NAMESPACE │  NAME  │ TARGET PORT │          URL           │
├───────────┼────────┼─────────────┼────────────────────────┤
│ default   │ k8sweb │             │ http://127.0.0.1:62222 │
└───────────┴────────┴─────────────┴────────────────────────┘
* Opening service default/k8sweb in default browser...
! Because you are using a Docker driver on windows, the terminal needs to be open to run it.
```