








#                                                     ***Parking Application***








## PS :
`YOU NEED TO RELOAD THIS PAGE EVERY TIME YOU NEED IT BECAUSE IT GETS UPDATED FREQUENTLY, CHECK IT BEFORE CONTACTING BACKEND DEVELOPER`  |
-|
`Most of the requests needs to include a valid token on the header`  |
-|


`most GET requests should be sent with page on the HEADER, you should expect pageCount on the response, if page==0 or no page sent, the response will conatains maximum 1000 entries`  |
-|

`most GET requests support searching, you can add search attribute on the header`  |
-|




### http status codes

| STATUS  | MESSAGE  |
|---|---|
| `200` | success |
| `201` | success and new entry created |
| `204` | success but response is empty |
| `400` | token errors (missing, invalid, expired ..) |
| `406` | this slot is empty |
| `403` | you dont have permission |
| `424` | All slots are busy .... |
| `423` |Sorry our Parking is Full .... |
| `522` | database fail, you should contact backend developer |
| `523` | operation error, redoing the action may success (it may be temporary error) |



-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

#  run the project after installing node module with the command ---->  npm run supervisor

## Register

``` POST
http://localhost:3000/accounts/register
```
### Request
if you dont provide token on the header, a super user will be created
```
{
  firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        email: DataTypes.STRING,
        telephone: DataTypes.STRING,
        password: DataTypes.STRING,




}
```
### Response
```
{
    user object or error
}
```
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-----





## login


``` POST
http://localhost:3000/accounts/login
```

### Request

```
{
  login: String,
  password: String
}
```

### Response

```
{
    user object or error
}
```





-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
## create new Parking and generate slots
``` POST
http://localhost:3000/parkings/create/
```
### Request BODY
admin can create new parking
```
{
  name: DataTypes.STRING,
  type: DataTypes.STRING,
  pricePerHour: DataTypes.REAL,
  capacity: DataTypes.INTEGER,
  slots[{"position":"par001A"}, {"position":"par001B"},{"position":"par001C"},{"position":"par001D"},{"position":"par001E"},{"position":"par001A"}]

}
```
### Response
```
{
    parking object
}
```
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
##verify Check In Car
``` POST
http://localhost:3000/cars/verifyCheckInCar/
```
### Request BODY
admin can check if the parking contains more empty slots or no
```
{
  martricul: DataTypes.STRING,
  type: DataTypes.STRING,

}
```
### Response
```
{
    "WELOCOME Your need to go to parking : X in slot position :"y
}
```


-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-----------------------



##verify Check In Car
``` PUT
http://localhost:3000/cars/checkOutCar/
```
### Request BODY
admin can do checkout of the car and liberate it and calculate the price to pay
```
{
  martricul: DataTypes.STRING,


}
```
### Response
```
{
    "Mr/Mss owner of car :Matricul "you need spend :10h "in our parking and you must pay :  12$
}
```


-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-----------------------
