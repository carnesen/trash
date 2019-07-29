Finally, `alwaysai app deploy`:
  - Copies your application files to the target directory
  - Installs from the alwaysAI cloud the computer vision models used by the application
  - Installs an isolated Python execution environment using [https://virtualenv.pypa.io/en/latest/])("virutalenv")
At that point your application is ready to go! Target-specific information is stored in a file `alwaysai.target.json` in the application directory and can be edited later using the command `alwaysai app configure`.
If you haven't already set up passwordless ssh connectivity to the device, you'll be prompted once to enter its ssh password. Subsequent connections will use key-based authentication with a unique private key `~/.ssh/alwaysai.id_rsa`. 

The realtime_object_detect uses a Caffe implementation of the MobileNet Single Shot Detector trained on the Pascal VOC dataset, and can identify 20 unique objects. To identify a much greater number of objects, we'll switch to a Tensorflow implementation of the MobileNet Single Shot Detector trained on the COCO dataset, which can identify over 90 unique objects!

## General Application Development

### Plan out your application

Similar to starting with starter applications, the first step is to choose
what you’d like to do. The alwaysAI model catalog includes models that support
a variety of computer vision primitives such as image classification and object
detection. 

### Configure and develop your app

1. Create an application directory and initiate your application. On your host
machine, enter in the command line

    ````
    alwaysai app init
    ````

    You should see a json configuration file, `alwaysai.app.json`, and a stub
    Python application, `app.py`. The Python application includes the most
    basic scaffolding. You can use this to build upon or discard it and start
    from scratch. The contents of the json configuration should look like below:


    ```
    {
      "name": "<application name>",
      "version": "<version>",
      "scripts": {
        "start": "<start cmd>"
      },
      "models": {}
    }
    ```

    You can manually inspect the configuration file or use the CLI command

    ```
    alwaysai app show
    ```


2. Add models to your configuration:

    ```
    alwaysai models add <cv model> [<cv model>] ...
    ```


3. Develop your application using the `app.py` file, which is the default start
   script. To use edgeIQ, import the edgeIQ package into your python application file:

    ```
    import edgeiq
    ```

    See the [edgeIQ User's Guide](edgeiq/users_guide.html) for more information on
    developing an application using the edgeIQ API.

### Deploy your application

After your application has been developed, the next step is to deploy your
application onto your target device. Deploying an app follows the same process
as steps 3 and 4 of the [Running a Demo Application](#running-a-demo-application)
section above.
