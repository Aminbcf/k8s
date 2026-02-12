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



