type Props = {
  order: any;
};

function DoneCard({ order }: Props) {
  const data = new Date(order.deadline);
  const hoje = new Date();

  const diffTime = data.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let bgColor = "bg-blue-50";

  if (diffDays <= 1) {
    bgColor = "bg-red-100";
  } else if (diffDays <= 3) {
    bgColor = "bg-yellow-100";
  }

  return (
    <div
      className={`px-2 py-1 border rounded-md ${bgColor} flex justify-between items-center gap-2 w-full`}
    >
      {/* infos */}
      <div className="min-w-0">
        <p className="font-semibold truncate">
          {order.cliente_nome}
        </p>
        <p className="text-sm">
          Prazo: {data.toLocaleDateString("pt-BR")}
        </p>
        <p className="text-sm">
          Pedido: {order.id}
        </p>
      </div>

      {/* botão lateral */}
      <button className="px-4 py-2 rounded-md bg-teal-600 text-lg text-white hover:bg-teal-700 transition whitespace-nowrap">
        Enviar
      </button>
    </div>
  );
}

export default DoneCard;