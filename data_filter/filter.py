

def filter(association_df, filter_parameters):
    # Create a copy of the association df
    filtered_df = association_df.copy(deep = True)

    print('[Info] Number of associations: {}'.format(len(filtered_df)))

    # {"pmid": 123, "efo": "EFO_000123", "pvalue": false}
    if filter_parameters['pmid']:
        filtered_df = filtered_df.loc[ filtered_df.PUBMEDID == filter_parameters['pmid']]

    if filter_parameters['efo']:
        filtered_df = filtered_df.loc[ filtered_df.MAPPED_TRAIT_URI == filter_parameters['efo']]

    if filter_parameters['pvalue']:
        filtered_df = filtered_df.loc[ filtered_df.PVALUE_MLOG >= filter_parameters['pvalue']]

    print('[Info] Number of associations: {}'.format(len(filtered_df)))
    return filtered_df
