import pandas as pd

from gwas_diagram.services.data_filter import data_filter
from gwas_diagram.services.data_loader import DataLoader
from gwas_diagram.configuration.properties import Configuration
from gwas_diagram.schemas.requests import RequestParameters
from gwas_diagram.schemas.plot_annotations import (IdeogramAnnots,
                                                   Ideogram,
                                                   ChromosomeAnnots)


class DiagramData:
    """Interface for diagram data.
    """
    def __init__(self, filters: RequestParameters = None) -> None:
        self.gwas_data = DataLoader(Configuration).get_data()
        self.filters = vars(filters)
        self.filtered_data = None
        self.ideogram = Ideogram()
        self._trait_colour_map_df = (pd.DataFrame
                                     .from_records(Configuration()
                                                   .TRAIT_COLOUR_MAP))

    def filter_data(self) -> pd.DataFrame:
        """Apply the filters to the data

        Returns:
            dataframe of filtered data
        """
        cols_to_keep = ['REGION',
                        'EFO_PARENT',
                        'CHR_ID',
                        'CHR_POS',
                        'SNPS']
        self.filtered_data = data_filter(association_df=self.gwas_data,
                                         filters=self.filters)[cols_to_keep]
        return self.filtered_data

    def _assign_track_indices(self) -> None:
        """Assign the track indices (and colour codes)
        to the parent trait categories.
        """
        self.filtered_data['trackIndex'] = pd.Categorical(self.filtered_data['EFO_PARENT']).codes
        trait_track = (self.filtered_data[['EFO_PARENT', 'trackIndex']]
                            .drop_duplicates()
                            .rename(columns={'EFO_PARENT': 'displayName',
                                             'trackIndex': 'id'})
                            .merge(self._trait_colour_map_df,
                                   how='left',
                                   on='displayName')
                            .to_dict('records'))
        self.ideogram.annotationTracks = trait_track

    def as_ideogram_annotation_model(self) -> Ideogram:
        """The filtered dataframe is grouped by cytological band and EFO_PARENT
        then get:
        length = size of the groups
        start = minimum position
        name = list of rsids
        These resulting dataframe is converted to the ideogram.js 
        annotation object.
        """
        # The dataframe is grouped by region and EFO_PARENT then get count:
        key = ['REGION', 'EFO_PARENT']  # grouping key
        self._assign_track_indices()
        length = (self.filtered_data
                  .groupby(key, as_index=False)
                  .size()
                  .rename(columns={"size": "length"}))
        start = (self.filtered_data
                 .groupby(key, as_index=False)
                 .CHR_POS.min()
                 .rename(columns={"CHR_POS": "start"}))
        name = (self.filtered_data
                .drop_duplicates(subset=['REGION', 'EFO_PARENT', 'SNPS'])
                .groupby(key, as_index=False)
                .SNPS.apply(', '.join)
                .rename(columns={"SNPS": "name"}))
        ideogram_df = pd.merge(self.filtered_data
                               .drop_duplicates(subset=key),
                               right=length,
                               how="left",
                               on=key)
        ideogram_df = ideogram_df.merge(start, how="left", on=key)
        ideogram_df = ideogram_df.merge(name, how="left", on=key)
        cols_to_keep = ['chr', 'name', 'start', 'length', 'trackIndex']
        ideogram_df = (ideogram_df
                       .rename(columns={'CHR_ID': 'chr'})[cols_to_keep]
                       .set_index('chr')
                       .sort_index())
        ideogram_list = []
        for chrom in ideogram_df.index.unique():
            annots = ideogram_df.loc[[chrom]].to_dict('records')
            annots_list = [*[list(idx.values()) for idx in annots]]
            ca = ChromosomeAnnots.parse_obj({"chr": chrom, "annots": annots_list})
            ideogram_list.append(ca)
        ideogram_data = IdeogramAnnots()
        ideogram_data.annots = ideogram_list
        self.ideogram.annotations = ideogram_data
        return self.ideogram
