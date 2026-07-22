type CategoryHeaderProps = {
  name: string
}

const CategoryHeader = ({ name }: CategoryHeaderProps) => {
  return (
    <div className="col-span-full mt-4 flex items-center gap-2 first:mt-0">
      <span
        className="h-5 w-1.5 shrink-0 rounded-full bg-primary"
        aria-hidden
      />
      <span className="font-black text-muted-foreground text-xs uppercase tracking-widest">
        {name}
      </span>
    </div>
  )
}

export default CategoryHeader
