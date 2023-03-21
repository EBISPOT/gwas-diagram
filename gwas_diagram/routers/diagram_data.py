from fastapi import APIRouter, Depends, Request
import json
import logging

from gwas_diagram.schemas.requests import RequestParameters
from gwas_diagram.schemas.plot_annotations import IdeogramAnnots
from gwas_diagram.configuration.properties import Configuration
from gwas_diagram.services.data_filter import data_filter
from gwas_diagram.services.data_loader import DataLoader
import gwas_diagram.endpoint_utils as eu
from gwas_diagram.services.main import DiagramData


logger = logging.getLogger(__name__)


router = APIRouter(
    responses={404: {"description": "Not found"}},
)


@router.get("/plotting_data",
            response_model=IdeogramAnnots)
async def get_diagram_data(req_filters: RequestParameters = Depends()):
    diagram_data = DiagramData(filters=req_filters)
    logger.info(
        f'Diagram filter. Parsed parameters: {json.dumps(diagram_data.filters)}')
    # Get filtered dataset:
    filtered_data = diagram_data.filter_data()
    logger.info(
        f'Number of associations/traits after filtering: {len(filtered_data)}')
    # reshape the filtered data:
    reshaped_data = diagram_data.as_ideogram_annotation_model()
    return reshaped_data


@router.get("/associations")
async def get_association_data(req_filters: RequestParameters = Depends()):
    global gwas_data
    # Parsing and validating input paramters
    req_filter_dict = vars(req_filters)
    logger.info(
        f'Association retriever. Parsed parameters: {json.dumps(req_filter_dict)}')
    # For retrieving associations, the dataType needs to be set null:
    if 'dataType' in req_filter_dict:
        req_filter_dict['dataType'] = None
    # Filter associations based on input parameters:
    filtered_data = data_filter(gwas_data, req_filter_dict)
    # reshape the filtered data:
    reshaped_data = eu.consolidate(filtered_data)
    logger.info(f'Number of associations returned: {len(reshaped_data)}')
    return reshaped_data
