from rest_framework.exceptions import APIException

class ReglasNegocio(APIException):

    status_code = 400

    def __init__(self, code: str, message: str):
        super().__init__({"code": code, "message": message})
