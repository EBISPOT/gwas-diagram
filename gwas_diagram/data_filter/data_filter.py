from typing import Union
import pandas as pd


class FilterDF:
    """Dataframe filtering class
    """
    def __init__(self,
                 df: pd.DataFrame) -> None:
        self.df = df

    def _filter_parent_term(self, parent_term: Union[list, None]) -> None:
        """Filter df on EFO_PARENT

        Arguments:
            parent_term -- parent efo term (list)
        """
        if parent_term is not None:
            self.df = self.df.loc[self.df.EFO_PARENT.isin(parent_term)]

    def _filter_pmid(self, pmid: Union[int, None]) -> None:
        """Filter df on PUBMEDID

        Arguments:
            pmid -- pubmed id
        """
        if pmid is not None:
            self.df = self.df.loc[self.df.PUBMEDID == str(pmid)]

    def _filter_trait(self, trait: Union[str, None]) -> None:
        """Filter df on MAPPED_TRAIT or DISEASE/TRAIT

        Arguments:
            trait -- trait
        """
        if trait is not None:
            pattern = f".*{trait}.*"
            self.df = self.df.loc[
                (self.df['MAPPED_TRAIT'].str.match(pat=pattern)) 
                | (self.df['DISEASE/TRAIT'].str.match(pat=pattern))
                ]

    def _filter_pvalue(self, pvalue: Union[float, None]) -> None:
        """Filter df on PVALUE_MLOG

        Arguments:
            pvalue -- neg log pvalue
        """
        if pvalue is not None:
            self.df = self.df.loc[self.df.PVALUE_MLOG >= pvalue]

    def _filter_catalog_date(self, catalog_date: Union[int, None]) -> None:
        """Filter df on CATALOG_DATE

        Arguments:
            catalog_date -- catalog_date (int)
        """
        if catalog_date is not None:
            self.df = self.df.loc[self.df.CATALOG_DATE <= catalog_date]

    def _filter_sample(self, sample: Union[str, None]) -> None:
        """Filter df on SAMPLE_DESCRIPTION

        Arguments:
            sample -- sample description
        """
        if sample is not None:
            pattern = f".*{sample}.*"
            self.df = (self.df.loc[
                (~self.df['SAMPLE_DESCRIPTION'].isna())
                & (self.df['SAMPLE_DESCRIPTION']
                   .str.match(pat=pattern))
                ])

    def _filter_ancestry(self, ancestry: Union[str, None]) -> None:
        """Filter df on BROAD ANCESTRAL CATEGORY

        Arguments:
            ancestry -- ancestry category
        """
        if ancestry is not None:
            pattern = f".*{ancestry}.*"
            self.df = (self.df.loc[
                (~self.df['BROAD ANCESTRAL CATEGORY'].isna())
                & (self.df['BROAD ANCESTRAL CATEGORY']
                   .str.match(pat=pattern))
                ])

    def _filter_data_type(self, data_type: Union[str, None]) -> None:
        """Filter df on data type: "traits" or "associations"

        Arguments:
            data_type -- "traits" or "associations"
        """
        if data_type == "traits":
            self.df = (self.df[['REGION',
                                'EFO_PARENT',
                                'MAPPED_TRAIT']]
                       .drop_duplicates()
                       )

    def _filter_cytological_band(self, cytological_band: Union[str, None]) -> None:
        """Filter df on cytological_band

        Arguments:
            cytological_band -- cytological_band of sample
        """
        if cytological_band is not None:
            self.df = self.df.loc[self.df.REGION == cytological_band]


def data_filter(association_df: pd.DataFrame,
                filters: dict) -> pd.DataFrame:
    """Filtering the association data.

    Args:
        association_df (pd.DataFrame): A dataframe containing the association data.
        filters (dict): A dictionary containing the filter parameters.
    Returns:
        pd.DataFrame: A dataframe containing the filtered association data.
    """
    filtered_df = FilterDF(df=association_df.copy(deep=True))
    # Apply filters:
    filtered_df._filter_parent_term(parent_term=filters.get('parent_term'))
    filtered_df._filter_pmid(pmid=filters.get('pmid'))
    filtered_df._filter_trait(trait=filters.get('trait'))
    filtered_df._filter_pvalue(pvalue=filters.get('pvalue'))
    filtered_df._filter_catalog_date(catalog_date=filters.get('catalog_date'))
    filtered_df._filter_sample(sample=filters.get('sample'))
    filtered_df._filter_ancestry(ancestry=filters.get('ancestry'))
    filtered_df._filter_data_type(data_type=filters.get('dataType'))
    filtered_df._filter_cytological_band(cytological_band=filters.get('cytological_band'))
    return filtered_df.df
