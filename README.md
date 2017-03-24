# HistriaJs
Node.js rule engine

## How to write an application

- Create Model  (json schema)
- Write business rules
- Expose model through views 


## Views

- A view can't have aggregation relationships. 
- A view have own properties and compositions or references to other entities

### Exaample



```
{
    "name": "UserDetail",
    "type": "object",
    "view": true,
    "nameSpace": "view-one",
    "properties": {
        "fullName": {
            "title": "FullName Name",
            "type": "string"
        }
    },
    "relations": {
        "master": {
            "type": "hasOne",
            "model": "user",
            "aggregationKind": "composite"
        }
    }
}
```


```
{
    "name": "user",
    "type": "object",
    "nameSpace": "view-one",
    "properties": {
        "firstName": {
            "title": "First Name",
            "type": "string"
        },
        "lastName": {
            "title": "Last Name",
            "type": "string"
        }
    }
}
```





