from fastapi import APIRouter, Depends
import json
import logging

from gwas_diagram.schemas.requests import RequestParameters
from gwas_diagram.schemas.plot_annotations import IdeogramAnnotations
from gwas_diagram.services.main import DiagramData


logger = logging.getLogger(__name__)


router = APIRouter(
    responses={404: {"description": "Not found"}},
)


@router.get("/annotations",
            response_model=IdeogramAnnotations)
async def get_annotations(req_filters: RequestParameters = Depends()):
    diagram_data = DiagramData(filters=req_filters, ideogram_layout='tracks')
    logger.info(
        f'Diagram filter. Parsed parameters: {json.dumps(diagram_data.filters)}')
    # Get filtered dataset:
    filtered_data = diagram_data.filter_data()
    logger.info(
        f'Number of associations/traits after filtering: {len(filtered_data)}')
    # reshape the filtered data:
    reshaped_data = diagram_data.as_ideogram_annotation_model()
    return reshaped_data


@router.get("/histogram",
            response_model=IdeogramAnnotations)
async def get_histogram(req_filters: RequestParameters = Depends()):
    diagram_data = DiagramData(filters=req_filters, ideogram_layout='histogram')
    logger.info(
        f'Diagram filter. Parsed parameters: {json.dumps(diagram_data.filters)}')
    # Get filtered dataset:
    filtered_data = diagram_data.filter_data()
    logger.info(
        f'Number of associations/traits after filtering: {len(filtered_data)}')
    # reshape the filtered data:
    reshaped_data = diagram_data.as_ideogram_annotation_model()
    return reshaped_data
