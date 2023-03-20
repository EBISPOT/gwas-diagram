from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, ORJSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

from gwas_diagram.routers.diagram_data import router

logging.config.fileConfig("gwas_diagram/log_conf.ini",
                          disable_existing_loggers=False)
logger = logging.getLogger(__name__)


API_BASE = ""


app = FastAPI(title="GWAS Diagram REST API")


@app.exception_handler(ValueError)
async def value_error_exception_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"message": str(exc)},
    )


# configure CORS
#app.add_middleware(CORSMiddleware, 
#                   allow_origins=['*'])


# v1 API (default)
app.include_router(router,
                   prefix=API_BASE,
                   include_in_schema=False,
                   default_response_class=ORJSONResponse)

app.include_router(router,
                   prefix=f"{API_BASE}/v1",
                   default_response_class=ORJSONResponse,
                   tags=["GWAS Diagram REST API"])
