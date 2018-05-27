const mypath="https://f74fb758.ngrok.io"

function todayDate(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    date = yyyy+'-'+mm+'-'+dd

    return date
}

function accepterfriend(id){
    var searchParams=new URLSearchParams()
    searchParams.set("id",id)
    fetch(mypath+"/profil/accept_fd/"+sessionStorage.user, {
        method: "POST",
        headers: { "Content-Type": 'application/x-www-form-urlencoded',
        "Authorization": "Bearer "+sessionStorage.token
    },
    body: searchParams
})
    .then(res =>{if(res.ok){
        res.json().then(response=>{
            alert(response)
            window.location.reload(true)  
        })
    }else{
        if(res.status==403){
            throw("Session expirée. Vous devez vous reconnecter.")
            expiredtoken()
        }
        if(res.status==404){
            throw("Vous n'avez pas le droit!")
        }
    }
})
    .catch(err => alert(err))

}

function supprimerinvitation(id){
    var searchParams=new URLSearchParams()
    searchParams.set("id",id)
    fetch(mypath+"/profil/request_fd/"+sessionStorage.user, {
        method: "DELETE",
        headers: { "Content-Type": 'application/x-www-form-urlencoded',
        "Authorization": "Bearer "+sessionStorage.token
    },
    body: searchParams
})
    .then(res =>{if(res.ok){
        res.json().then(response=>{
            alert(response)
            window.location.reload(true)  
        })
    }else{
        if(res.status==403){
            throw("Session expirée. Vous devez vous reconnecter.")
            expiredtoken()
        }
        else{throw("DELETE FRIEND INVITATION ERROR")}
    }})
    .catch(err => alert(err))

}

function Modifier(table,index){
    var monobjet = JSON.parse(sessionStorage.getItem(table))
    var objet=monobjet[index]

    var p1 = prompt("Montant de la dette/créance: ",Number(objet.montant).toFixed(2))

    if(p1===null){

    }
    else if(isNaN(Number(p1.replace(',','.'))) || typeof(Number(p1.replace(',','.'))) !== "number"){
        alert("Veuiller spécifier un chiffre!")
    }
    else{
        var x=Number(p1.replace(',','.')).toFixed(2)

        var b = prompt("Descripion : ", objet.description)
        if(b===null){

        }else{

            const searchParams = new URLSearchParams();
            searchParams.set('id',objet._id)
            searchParams.set('montant',x)
            searchParams.set('description',b)

            fetch(mypath+"/creance_modification", {
                method: "PATCH",
                headers: { "Content-Type": 'application/x-www-form-urlencoded',
                "Authorization": "Bearer "+sessionStorage.token
            },
            body: searchParams
        }).then(res =>{if(res.ok){
            res.json().then(response=>{
                alert("Modification valide")
                window.location.reload(true)
            })
            
        }else{
            if(res.status==403){
                throw("Session expirée. Vous devez vous reconnecter.")
                expiredtoken()
            }else{
                throw("Error de modification")
            }
        }})
        .catch(err => alert(err))
    }
}
}

function accepter(arg,state){
    var msg
    var title
    if(state=="closed"){
        msg="Voulez-vous clôturer cette créance?"
        title="Clôture"
    }
    if(state=="actif"){
        msg="Voulez-vous accepter cette créance ou dette?"
        title="Acceptation"
    }
    var confirm=phonon.confirm(msg,title,'cancelable',"Confirmer","Annuler")
    confirm.on('confirm',function(){

        const searchParams = new URLSearchParams();
        searchParams.set('id',arg)
        searchParams.set('etat',state)

        fetch(mypath+"/creance_accept", {
            method: "PATCH",
            headers: { "Content-Type": 'application/x-www-form-urlencoded',
            "Authorization": "Bearer "+sessionStorage.token
        },
        body: searchParams
    }).then(res =>{if(res.ok){
        res.json().then(response=>{
         alert("Acceptation valide")
         window.location.reload(true)
     })
        
    }else{
        if(res.status==403){
            throw("Session expirée. Vous devez vous reconnecter.")
            expiredtoken()
        }else{
            throw("Error d'acceptation")
        }
    }})
    .catch(err => alert(err))
})
}

function rembourser(arg,state){
    var confirm=phonon.confirm("Voulez-vous rembourser cette dette?","Remboursement",'cancelable',"Confirmer","Annuler")
    confirm.on('confirm',function(){

        const searchParams = new URLSearchParams();
        searchParams.set('id',arg)
        searchParams.set('etat',state)

        fetch(mypath+"/creance_accept", {
            method: "PATCH",
            headers: { "Content-Type": 'application/x-www-form-urlencoded',
            "Authorization": "Bearer "+sessionStorage.token
        },
        body: searchParams
    }).then(res =>{if(res.ok){
        res.json().then(response=>{
            alert("Acceptation valide")
            window.location.reload(true)
        })
    }else{
        throw("Error d'acceptation")
    }})
    .catch(err => alert(err))
})
}

function myparams() {
  var test=window.location.hash.split("/")
  return test[1]
}

function expiredtoken(){
    sessionStorage.token=null
    sessionStorage.user=null
    sessionStorage.username=null
    sessionStorage.friends=null
    sessionStorage.friends_length=null
    sessionStorage.actifcreances=null
    sessionStorage.actifdettes=null
    window.location.href="#!home"
}

function logout(){
    var confirm=phonon.confirm("Voulez-vous vous déconnecter?","Déconnexion",'cancelable',"Confirmer","Annuler")
    confirm.on('confirm',function(){
        sessionStorage.token=null
        sessionStorage.user=null
        sessionStorage.username=null
        sessionStorage.friends=null
        sessionStorage.friends_length=null
        sessionStorage.actifcreances=null
        sessionStorage.actifdettes=null
        window.location.href="#!home"

    })
    confirm.on('cancel',function(){

    })
}


function myarray(argarray,length,state){
    var mytab=[]
    for (var i = 0; i < length; i++) {
        if (argarray[i].etat==state) {
            mytab.push(argarray[i])
        }    
    }
    return mytab
}

function mycreatedarray(argarray,length,state,creator){
    var mytab=[]
    for (var i = 0; i < length; i++) {
        if ( argarray[i].etat==state && argarray[i].createur==creator) {
            mytab.push(argarray[i])
        }    
    }
    return mytab
}

function invitationsarray(argarray,length,state,user){
    var mytab=[]
    for (var i = 0; i < length; i++) {
        if (argarray[i].etat==state && argarray[i].createur != user){
            mytab.push(argarray[i])

        }    
    }
    return mytab
}

function supprimer(arg){
    var confirm=phonon.confirm("Voulez-vous supprimer cet ami?", "Supprimer "+arg, 'cancelable', "Confirmer", "Annuler")
    confirm.on('confirm', 
        function(){
            const searchParams = new URLSearchParams();
            searchParams.set('name',sessionStorage.user)
            searchParams.set('delete_friend',arg);


            fetch(mypath+"/profil_delete/"+sessionStorage.user, {
                method: "DELETE",
                headers: { "Content-Type": 'application/x-www-form-urlencoded',
                "Authorization": "Bearer "+sessionStorage.token
            },
            body: searchParams
        }).then(res =>{if(res.ok){
            res.json().then(response=>{
                alert("Ami supprimé!")
                window.location.reload(true)
            })
            
        }else{
            if(res.status==403){
                throw("Session expirée. Vous devez vous reconnecter.")
                expiredtoken()
            }else{
                throw("Delete friend error")
            }
        }})
        .catch(err => alert(err))
    })
    confirm.on('cancel', function(){} );
}

function displayfriends(){
    fetch(mypath+"/friends/"+sessionStorage.user, {
        method: "GET",
        headers: { "Content-Type": 'application/x-www-form-urlencoded',
        "Authorization": "Bearer "+sessionStorage.token
    }
})
    .then(res =>{if(res.ok){
        res.json().then(response=>{

            sessionStorage.setItem("friends",JSON.stringify(response.results))
            sessionStorage.friends_length=response.length
            const ul=document.querySelector('#friendlist')
            ul.innerHTML=""

            var monobjet = response.results;

            for (i = 0; i < response.length; i++) { 
                const li=document.createElement('li')
                li.className="padded-list"
                li.innerHTML="<a  class='pull-right mydelete' onClick=supprimer('"+monobjet[i]+"')></a>"+monobjet[i]
                ul.appendChild(li)
            }
        })
    }else{
        if(res.status==403){
            throw("Session expirée. Vous devez vous reconnecter.")
            expiredtoken()
        }else{
            throw("Get friends list error")
        }
    }})
    .catch(err => alert(err))
}


function displayfriendsrequest(){
    fetch(mypath+"/profil/accept_fd/"+sessionStorage.user, {
        method: "GET",
        headers: { "Content-Type": 'application/x-www-form-urlencoded',
        "Authorization": "Bearer "+sessionStorage.token
    }
})
    .then(res =>{if(res.ok){
        res.json().then(response=>{

            const ul=document.querySelector('#friendrequestlist')
            ul.innerHTML=""

            var monobjet = response.results

            for (i = 0; i < monobjet.length; i++) { 
                const li=document.createElement('li')
                li.className="padded-list"
                li.innerHTML="<a  class='pull-right myaccept' onClick=accepterfriend('"+monobjet[i]._id+"')></a>"+monobjet[i].demandeur
                ul.appendChild(li)
            }
        })
    }else{
        if(res.status==403){
            throw("Session expirée. Vous devez vous reconnecter.")
            expiredtoken()
        }
        else{
            throw("GET FRIENDS INVITATIONS ERROR")
        }
    }})
    .catch(err => alert(err))
}

function displaymyfriendsrequest(){
    fetch(mypath+"/profil/request_fd/"+sessionStorage.user, {
        method: "GET",
        headers: { "Content-Type": 'application/x-www-form-urlencoded',
        "Authorization": "Bearer "+sessionStorage.token
    }
})
    .then(res =>{if(res.ok){
        res.json().then(response=>{

            const ul=document.querySelector('#myfriendrequestlist')
            ul.innerHTML=""

            var monobjet = response.results

            for (i = 0; i < monobjet.length; i++) { 
                const li=document.createElement('li')
                li.className="padded-list"
                li.innerHTML="<a  class='pull-right mydelete' onClick=supprimerinvitation('"+monobjet[i]._id+"')></a>"+monobjet[i].receveur
                ul.appendChild(li)
            }
        })
    }else{
        if(res.status==403){
            throw("Session expirée. Vous devez vous reconnecter.")
            expiredtoken()
        }else{
            throw("GET FRIENDS INVITATIONS ERROR")
        }
    }})
    .catch(err => alert(err))
}


function displaycreance(){
    fetch(mypath+"/epargne_creance/"+sessionStorage.user, {
        method: "GET",
        headers: { "Content-Type": 'application/x-www-form-urlencoded',
        "Authorization": "Bearer "+sessionStorage.token
    }
})
    .then(res =>{if(res.ok){
        res.json().then(response=>{
            var monobjet = response.creance


                        // Liste de créances actives

                        const ul11=document.querySelector('#creance-active-list')
                        ul11.innerHTML=""
                        

                        var actiflist=myarray(monobjet,response.length,"actif")
                        sessionStorage.actifcreances=JSON.stringify(actiflist)

                        for (i = 0; i < actiflist.length; i++) { 
                            const li=document.createElement('li')
                            li.className="padded-list"
                            li.innerHTML=""

                            if(actiflist[i].createur==sessionStorage.user){
                                li.innerHTML+="<a  class='pull-right myedit' onClick=Modifier('actifcreances','"+i+"')></a>"
                            }

                            li.innerHTML+=actiflist[i].email_debiteur+" | <strong>"+actiflist[i].montant+"€ </strong> | "+actiflist[i].start_date
                            if(actiflist[i].description!=""){
                                li.innerHTML+=" | "+actiflist[i].description
                            }
                            ul11.appendChild(li)
                        }

                        // Liste de créances en attente de confirmation de l'autre

                        const ul12=document.querySelector('#creance-pending-list')
                        ul12.innerHTML=""
                        

                        var pendinglist=mycreatedarray(monobjet,response.length,"creation",sessionStorage.user)

                        for (i = 0; i < pendinglist.length; i++) { 
                            const li=document.createElement('li')
                            li.className="padded-list"
                            li.innerHTML="<a  class='pull-right'></a>"+pendinglist[i].email_debiteur+" | <strong>"+pendinglist[i].montant+"€ </strong> | "+pendinglist[i].start_date
                            if(pendinglist[i].description!=""){
                                li.innerHTML+=" | "+pendinglist[i].description
                            }
                            ul12.appendChild(li)
                        }


                        // Liste de creances cloturés
                        const ul13=document.querySelector('#creance-closed-list')
                        ul13.innerHTML=""
                        

                        var closedlist=myarray(monobjet,response.length,"closed")

                        for (i = 0; i < closedlist.length; i++) { 
                            const li=document.createElement('li')
                            li.className="padded-list"
                            li.innerHTML="<a  class='pull-right'></a>"+closedlist[i].email_debiteur+" | <strong>"+closedlist[i].montant+"€ </strong> | "+closedlist[i].start_date
                            if(closedlist[i].description!=""){
                                li.innerHTML+=" | "+closedlist[i].description
                            }
                            ul13.appendChild(li)
                        }


                        // Liste de creances en attente de fermeture à confirmer (Non modifiable)
                        const ul4=document.querySelector('#creance-pending-closed-list')
                        ul4.innerHTML=""
                        

                        var pendingclosedlist=myarray(monobjet,response.length,"refunded")


                        for (i = 0; i < pendingclosedlist.length; i++) { 
                            const li=document.createElement('li')
                            li.className="padded-list"
                            li.innerHTML="<a  class='pull-right myaccept' onClick=accepter('"+pendingclosedlist[i]._id+"','closed')></a>"+pendingclosedlist[i].email_debiteur+" | <strong>"+pendingclosedlist[i].montant+"€ </strong> | "+pendingclosedlist[i].start_date
                            if(pendingclosedlist[i].description!=""){
                                li.innerHTML+=" | "+pendingclosedlist[i].description
                            }
                            ul4.appendChild(li)
                        }


                        // Invitations de creations de liste (Modifiable)
                        const ul=document.querySelector('#creance-invitation')
                        ul.innerHTML=""
                        var invitationslist=invitationsarray(monobjet,response.length,"creation",sessionStorage.user)

                        for (i = 0; i < invitationslist.length; i++) { 
                            const li=document.createElement('li')
                            li.className="padded-list"
                            li.innerHTML="<a  class='pull-right myaccept' onClick=accepter('"+invitationslist[i]._id+"','actif')></a>"+invitationslist[i].email_debiteur+" | <strong>"+invitationslist[i].montant+"€ </strong> | "+invitationslist[i].start_date
                            if(invitationslist[i].description!=""){
                                li.innerHTML+=" | "+invitationslist[i].description
                            }
                            ul.appendChild(li)
                        }
                        
                    })
}else{
    if(res.status==403){
        throw("Session expirée. Vous devez vous reconnecter.")
        expiredtoken()
    }else{
        throw("Get creance error")
    }
}})
.catch(err => alert(err))
}


function displaydette(){
    fetch(mypath+"/epargne_dette/"+sessionStorage.user, {
        method: "GET",
        headers: { "Content-Type": 'application/x-www-form-urlencoded',
        "Authorization": "Bearer "+sessionStorage.token
    }
})
    .then(res =>{if(res.ok){
        res.json().then(response=>{

            var monobjet = response.dette

                        // Liste de dettes actives


                        const ul11=document.querySelector('#dette-active-list')
                        ul11.innerHTML=""
                        

                        var actiflist=myarray(monobjet,response.length,"actif")
                        sessionStorage.actifdettes=JSON.stringify(actiflist)

                        for (i = 0; i < actiflist.length; i++) { 
                            const li=document.createElement('li')
                            li.className="padded-list"
                            li.innerHTML=""


                            if(actiflist[i].createur==sessionStorage.user){
                                li.innerHTML+="<a  class='pull-right myedit' onClick=Modifier('actifdettes','"+i+"')></a> "
                            }

                            li.innerHTML+="<a  class='pull-right myrefund' onClick=rembourser('"+actiflist[i]._id+"','refunded')></a>"+actiflist[i].email_crediteur+" | <strong>"+actiflist[i].montant+"€ </strong> | "+actiflist[i].start_date
                            if(actiflist[i].description!=""){
                                li.innerHTML+=" | "+actiflist[i].description
                            }
                            ul11.appendChild(li)
                        }

                        // Liste de dettes en attente de confirmation de l'autre

                        const ul12=document.querySelector('#dette-pending-list')
                        ul12.innerHTML=""
                        

                        var pendinglist=mycreatedarray(monobjet,response.length,"creation",sessionStorage.user)

                        for (i = 0; i < pendinglist.length; i++) { 
                            const li=document.createElement('li')
                            li.className="padded-list"
                            li.innerHTML="<a  class='pull-right'></a>"+pendinglist[i].email_crediteur+" | <strong>"+pendinglist[i].montant+"€ </strong> | "+pendinglist[i].start_date
                            
                            if(pendinglist[i].description!=""){
                                li.innerHTML+=" | "+pendinglist[i].description
                            }
                            ul12.appendChild(li)
                        }


                        // Liste de dettes cloturés
                        const ul13=document.querySelector('#dette-closed-list')
                        ul13.innerHTML=""
                        

                        var closedlist=myarray(monobjet,response.length,"closed")

                        for (i = 0; i < closedlist.length; i++) { 
                            const li=document.createElement('li')
                            li.className="padded-list"
                            li.innerHTML="<a  class='pull-right'></a>"+closedlist[i].email_crediteur+" | <strong>"+closedlist[i].montant+"€ </strong> | "+closedlist[i].start_date
                            if(closedlist[i].description!=""){
                                li.innerHTML+=" | "+closedlist[i].description
                            }
                            ul13.appendChild(li)
                        }


                        // Liste de dettes en attente de fermeture à confirmer
                        const ul4=document.querySelector('#dette-pending-closed-list')
                        ul4.innerHTML=""
                        

                        var pendingclosedlist=myarray(monobjet,response.length,"refunded")


                        for (i = 0; i < pendingclosedlist.length; i++) { 
                            const li=document.createElement('li')
                            li.className="padded-list"
                            li.innerHTML="<a  class='pull-right')></a>"+pendingclosedlist[i].email_crediteur+" | <strong>"+pendingclosedlist[i].montant+"€ </strong> | "+pendingclosedlist[i].start_date
                            if(pendingclosedlist[i].description!=""){
                                li.innerHTML+=" | "+pendingclosedlist[i].description
                            }
                            ul4.appendChild(li)
                        }


                        // Invitations de creations de dette
                        const ul=document.querySelector('#dette-invitation')
                        ul.innerHTML=""
                        var invitationslist=invitationsarray(monobjet,response.length,"creation",sessionStorage.user)

                        for (i = 0; i < invitationslist.length; i++) { 
                            const li=document.createElement('li')
                            li.className="padded-list"
                            li.innerHTML="<a  class='pull-right myaccept' onClick=accepter('"+invitationslist[i]._id+"','actif')></a>"+invitationslist[i].email_debiteur+" | <strong>"+invitationslist[i].montant+"€ </strong> | "+invitationslist[i].start_date
                            if(invitationslist[i].description!=""){
                                li.innerHTML+=" | "+invitationslist[i].description
                            }
                            ul.appendChild(li)
                        }
                        
                    })
}else{
    if(res.status==403){
        throw("Session expirée. Vous devez vous reconnecter.")
        expiredtoken()
    }else{
        throw("Get dette error")
    }
}})
.catch(err => alert(err))
}


function displayphoto(){
    fetch(mypath+"/photo/"+sessionStorage.user, {
        method: "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Bearer "+sessionStorage.token },
    })
    .then(res =>{if(res.ok){
        res.json().then(response=>{
            var image=document.getElementById("photo")
            image.src=response.photo
            window.location.href="#!profil"
        })
    }else{
        if(res.status==403){
            throw("Session expirée. Vous devez vous reconnecter.")
            expiredtoken()
        }else{
            throw("Get photo error")
        }
    }})
    .catch(err => alert(err))
}


function displaytotal(){

    var creances=JSON.parse(sessionStorage.actifcreances)
    var dettes=JSON.parse(sessionStorage.actifdettes)
    var somme_c=0;
    var somme_d=0;

    for (var i = 0; i < creances.length; i++) {
        somme_c=Number(creances[i].montant) + Number(somme_c)
    }
    for (var j = 0; j < dettes.length; j++) {
        somme_d=Number(dettes[j].montant) + Number(somme_d)
    }
    var total=Number(somme_c-somme_d).toFixed(2)

    const ul=document.querySelector('#totalsomme')
    ul.innerHTML=""
    const li=document.createElement('div')
    var className="positif"
    if(total<0){
        var className="negatif"
    }
    li.innerHTML="<h4>Total: <span class='"+className+"'><strong>"+total + "</strong> €</span></h4>"
    ul.appendChild(li)

}

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {

        phonon.options({
            navigator: {
                defaultPage: 'home',
                animatePages: true,
                enableBrowserBackButton: true,
                templateRootDirectory: './pages'
            },
            i18n: null
        })
        const phononApp = phonon.navigator();

        phononApp.on({ page:'home', preventClose: false, content: 'home.html', readyDelay: 1}, activity => {
            activity.onReady(()=>{     
            })
        })


        phononApp.on({ page:'signup', preventClose: false, content: 'signup.html', readyDelay: 1}, activity => {

            activity.onCreate(self => {
                document.querySelector('#signup-submit').on('tap', () => {

                    const searchParams = new URLSearchParams();
                    searchParams.set('email', document.querySelector('#signup-email').value);
                    searchParams.set('password',document.querySelector('#signup-password').value);
                    searchParams.set('cpassword',document.querySelector('#signup-cpassword').value);
                    searchParams.set('username', document.querySelector('#signup-username').value);

                    fetch(mypath+"/signup", {
                      method: "POST",
                      headers: { "Content-Type": "application/x-www-form-urlencoded" },
                      body: searchParams
                  })
                    .then(res =>{if(res.ok){
                        res.json().then(response=>{
                            alert("Inscription réussie! Vous allez être dirigée à la page d'accueil.")
                            phononApp.changePage("home")
                        })
                    }else{
                        throw("Inscription invalide")
                    }})
                    .catch(err => alert(err))
                })
            })

            activity.onHashChanged(self =>{
                document.querySelector("#signup-email").value=""
                document.querySelector("#signup-password").value=""
                document.querySelector("#signup-cpassword").value=""
                document.querySelector("#signup-username").value=""
                
            })

        })

        phononApp.on({ page:'login', preventClose: false, content: 'login.html', readyDelay: 1}, activity => {
            activity.onCreate(self =>{
                document.querySelector("#login-submit").on('tap',()=>{
                    const searchParams = new URLSearchParams();
                    const tmp=document.querySelector('#login-email').value;
                    searchParams.set('email', tmp);
                    searchParams.set('password',document.querySelector('#login-password').value)



                    fetch(mypath+"/login", {
                        method: "POST",
                        headers: { "Content-Type": 'application/x-www-form-urlencoded'
                    },
                    body: searchParams
                }).then(res =>{if(res.ok){
                    res.json().then(response=>{
                        sessionStorage.token=response.token;
                        sessionStorage.user=tmp;
                        sessionStorage.username=response.username;
                        sessionStorage.photo=response.photo;
                        alert("Connexion réussie")
                        phononApp.changePage('profil')
                    })
                    
                }else{
                    throw("Login error")
                }})
                .catch(err => alert(err))
            })
            })

            activity.onHashChanged(self =>{
                document.querySelector("#login-email").value=""
                document.querySelector("#login-password").value=""
            })

        })


        phononApp.on({ page:'profil', preventClose: false, content: 'profil.html', readyDelay: 1}, activity => {

            function cameraGetPicture() {
               navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
                  destinationType: Camera.DestinationType.DATA_URL,
                  sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                  targetWidth: 160,
                  targetHeight: 160
              });

               function onSuccess(imageURL) {

                  var imagedata= "data:image/jpeg;base64,"+imageURL;

                  const searchParams = new URLSearchParams();
                  searchParams.set('photo',imagedata)

                  fetch(mypath+"/photo/"+sessionStorage.user, {
                    method: "PATCH",
                    headers: { "Content-Type": 'application/x-www-form-urlencoded',
                    "Authorization": "Bearer "+sessionStorage.token
                },
                body: searchParams
            }).then(res =>{if(res.ok){
                res.json().then(response=>{
                    alert("Ajout de photo réussi")
                    window.location.reload(true)
                })
                
            }else{
                if(res.status==403){
                    throw("Session expirée. Vous devez vous reconnecter.")
                    expiredtoken()
                }else{
                    throw("Ajout photo error")
                }
            }})
            .catch(err => alert(err))

        }

        function onFail(message) {
          alert('Failed because: ' + message);
      }

  }

  activity.onCreate(self =>{
    const ul=document.querySelector('#profil-email')
    const li = document.createElement('div')
    li.innerHTML="<h4> Username: "+sessionStorage.username+"<br>Email: " + sessionStorage.user + "</h4>"
    ul.appendChild(li)


    document.getElementById("uploadphoto").addEventListener("click",cameraGetPicture)
    displayphoto()

    displayfriends()
    displaycreance()
    displaydette()
    displayfriendsrequest()
    displaymyfriendsrequest()
    displaytotal()


})


  activity.onHashChanged(self => {
    displayfriends()
    displaycreance()
    displaydette()
    displayfriendsrequest()
    displaymyfriendsrequest()
    displaytotal()
})


})

        phononApp.on({ page:'addfriend', preventClose: false, content: 'addfriend.html', readyDelay: 1}, activity => {

            activity.onReady(self =>{
                document.querySelector("#addfriend-submit").on('tap',()=>{
                    const searchParams = new URLSearchParams();
                    searchParams.set('name',sessionStorage.user)
                    searchParams.set('add_friend',document.querySelector('#friend-email').value);


                    fetch(mypath+"/profil_add/"+sessionStorage.user, {
                        method: "POST",
                        headers: { "Content-Type": 'application/x-www-form-urlencoded',
                        "Authorization": "Bearer "+sessionStorage.token
                    },
                    body: searchParams
                }).then(res =>{if(res.ok){
                    res.json().then(response=>{
                     alert("Ajout réussi")
                     phononApp.changePage("profil")
                 })
                    
                }else{
                    if(res.status==403){
                        throw("Session expirée. Vous devez vous reconnecter.")
                        expiredtoken()
                    }
                    if(res.status==405){
                        throw("Demande déjà envoyée")
                    }
                    else{
                        throw("Déjà ami ou email non existant")
                    }
                }})
                .catch(err => alert(err))
            })
            })

            activity.onHashChanged(self =>{
                document.querySelector("#friend-email").value=""
            })

        })


        phononApp.on({ page:'creance', preventClose: false, content: 'creance.html', readyDelay: 1}, activity => {
            function friendsoptions(){
                const sel=document.querySelector("#friendoptions")
                sel.innerHTML=""
                var myfriends = JSON.parse(sessionStorage.friends)
                for (var i = 0; i < sessionStorage.friends_length; i++) {
                    const opt=document.createElement("option")
                    opt.innerHTML="<option value='"+myfriends[i]+"'>"+myfriends[i]+"</option>"
                    sel.appendChild(opt)
                }
            }

            activity.onReady(self=>{
                friendsoptions()
                document.querySelector("#creance-submit").on('tap',()=>{
                    var type=document.querySelector("#creance-user").value
                    var date=document.querySelector("#creance-date").value
                    var description=document.querySelector("#creance-text").value
                    var selected=document.querySelector("#friendoptions")
                    var dest=selected.options[selected.selectedIndex].value
                    var test=document.querySelector("#creance-montant").value
                    var montant=test.replace(",",".")


                    if(type=="crediteur"){
                        var crediteur=sessionStorage.user
                        var debiteur=dest
                    }else{
                        var crediteur=dest
                        var debiteur=sessionStorage.user
                    }

                    
                    if(date==""){
                        date=todayDate()
                    }

                    const searchParams = new URLSearchParams()
                    searchParams.set('createur',sessionStorage.user)
                    searchParams.set('crediteur',crediteur)
                    searchParams.set('debiteur',debiteur)
                    searchParams.set('date',date)
                    searchParams.set('montant',montant)
                    searchParams.set('description',description)
                    searchParams.set('etat','creation')
                    
                    fetch(mypath+"/epargne", {
                        method: "POST",
                        headers: { "Content-Type": 'application/x-www-form-urlencoded',
                        "Authorization": "Bearer "+sessionStorage.token
                    },
                    body: searchParams
                }).then(res =>{if(res.ok){
                    res.json().then(response=>{
                        alert("Création de créance/dette réussi")
                        phononApp.changePage('profil')
                    })
                }else{
                    if(res.status==403){
                        throw("Session expirée. Vous devez vous reconnecter.")
                        expiredtoken()
                    }
                    else{
                        throw("Création créance/dette error")
                    }
                }})
                .catch(err => alert(err))

            })
            })
            activity.onHashChanged(self=>{
                friendsoptions()
                document.querySelector("#creance-date").value=""
                document.querySelector("#creance-text").value=""
                document.querySelector("#creance-montant").value=""
            })
        })

        phononApp.start()

    },
};

app.initialize();